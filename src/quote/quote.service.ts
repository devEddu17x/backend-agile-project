import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuoteEntity } from './entities/quote.entity';
import { Repository } from 'typeorm/repository/Repository';
import { QuoteDetailEntity } from './entities/quote-detail.entity';
import { CreateQuoteDTO, QuoteDetailDTO } from './dtos/create-quote.dto';
import { CustomerService } from 'src/customer/customer.service';
import { DataSource } from 'typeorm';
import { ClothesService } from 'src/clothes/services/clothes.service';
import { ClothesPrice } from './interfaces/clothes-price.interface';
import { QuoteStatus } from './enums/status.enum';
import { QuoteSummary } from './interfaces/clothes-data.interface';
import { CreatedClothes } from './interfaces/created-clothes.interface';
import { UpdateQuoteDTO } from './dtos/update-quote.dto';
import { ClothesVariantsService } from 'src/clothes/services/clothes-variants.service';

@Injectable()
export class QuoteService {
  constructor(
    @InjectRepository(QuoteEntity)
    private readonly quoteRepository: Repository<QuoteEntity>,
    @InjectRepository(QuoteDetailEntity)
    private readonly quoteDetailRepository: Repository<QuoteDetailEntity>,
    private readonly customerService: CustomerService,
    private readonly clothesService: ClothesService,
    private readonly clothesVariantsService: ClothesVariantsService,
    private readonly dataSource: DataSource,
  ) {}

  async createQuote(dto: CreateQuoteDTO): Promise<CreatedClothes> {
    this.validateCustomizations(dto.details);

    const customer = await this.customerService.getCustomerById(dto.customerId);
    const variantsPrice = await this.getDetailUnitPrice(dto);
    const total = this.calculateTotal(variantsPrice);
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const newQuote = await queryRunner.manager.save(
        QuoteEntity,
        this.quoteRepository.create({
          customerId: customer.id,
          total,
        }),
      );

      const detailsToSave = variantsPrice.map((vp) => {
        // Buscar las customizaciones correspondientes del DTO
        const dtoDetail = dto.details.find(
          (d) => d.clothesVariantId === vp.variantId,
        );

        return this.quoteDetailRepository.create({
          quoteId: newQuote.id,
          unitPrice: vp.unitPrice,
          quantity: vp.quantity,
          clothesVariantId: vp.variantId,
          customizations: dtoDetail?.customizations || [],
        });
      });
      const savedDetails = await queryRunner.manager.save(
        QuoteDetailEntity,
        detailsToSave,
      );
      await queryRunner.commitTransaction();
      return { ...newQuote, details: savedDetails };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Error creating quote');
    } finally {
      await queryRunner.release();
    }
  }

  async getAll(): Promise<QuoteSummary[]> {
    return this.fetchQuotes();
  }

  async getQuoteById(id: string): Promise<QuoteEntity> {
    try {
      const quote = await this.quoteRepository.findOne({
        where: { id },
        relations: [
          'customer',
          'details',
          'details.clothesVariant',
          'details.clothesVariant.gender',
          'details.clothesVariant.size',
        ],
      });
      if (!quote) {
        throw new NotFoundException(`Quote with ID ${id} not found`);
      }
      return quote;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error fetching quote with ID ${id}`);
    }
  }

  async updateStatus(id: string, status: QuoteStatus): Promise<QuoteEntity> {
    try {
      const updateResult = await this.quoteRepository.update(
        { id },
        { status },
      );
      if (updateResult.affected === 0) {
        throw new NotFoundException('Quote not found');
      }
      const updatedQuote = await this.quoteRepository.findOne({
        where: { id },
      });
      if (!updatedQuote) {
        throw new NotFoundException('Quote not found after update');
      }
      return updatedQuote;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error updating quote status');
    }
  }

  async getQuotesByStatus(status: QuoteStatus): Promise<QuoteSummary[]> {
    return this.fetchQuotes(status);
  }

  async updateQuote(id: string, dto: UpdateQuoteDTO): Promise<CreatedClothes> {
    this.validateCustomizations(dto.details);
    this.validateNoDuplicateVariants(dto.details);

    const existingQuote = await this.quoteRepository.findOne({
      where: { id },
      relations: ['customer'],
    });

    if (!existingQuote) {
      throw new NotFoundException(`Quote with ID ${id} not found`);
    }

    if (existingQuote.status !== QuoteStatus.PENDING) {
      throw new BadRequestException(
        'Only PENDING quotes can be edited. Current status: ' +
          existingQuote.status,
      );
    }

    // Calcular precios de las nuevas variantes (reutiliza lógica de createQuote)
    const variantsPrice = await this.getDetailUnitPrice({
      details: dto.details,
      customerId: existingQuote.customerId,
    } as CreateQuoteDTO);

    const newTotal = this.calculateTotal(variantsPrice);

    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // 1. Eliminar todos los detalles existentes
      await queryRunner.manager.delete(QuoteDetailEntity, {
        quoteId: id,
      });

      // 2. Actualizar el total de la cotización
      await queryRunner.manager.update(
        QuoteEntity,
        { id },
        { total: newTotal },
      );

      // 3. Crear los nuevos detalles
      const newDetailsToSave = variantsPrice.map((vp) => {
        // Buscar las customizaciones correspondientes del DTO
        const dtoDetail = dto.details.find(
          (d) => d.clothesVariantId === vp.variantId,
        );

        return this.quoteDetailRepository.create({
          quoteId: id,
          unitPrice: vp.unitPrice,
          quantity: vp.quantity,
          clothesVariantId: vp.variantId,
          customizations: dtoDetail?.customizations || [],
        });
      });

      const savedDetails = await queryRunner.manager.save(
        QuoteDetailEntity,
        newDetailsToSave,
      );

      await queryRunner.commitTransaction();

      // 4. Obtener la cotización actualizada con todos sus datos
      const updatedQuote = await this.quoteRepository.findOne({
        where: { id },
      });

      return { ...updatedQuote, details: savedDetails };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error updating quote:', error);
      throw new BadRequestException('Error updating quote');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Private method that builds and executes the query to fetch quotes
   * @param status - Optional. Filter by specific status
   * @returns Array of quotes with summary
   */
  private async fetchQuotes(status?: QuoteStatus): Promise<QuoteSummary[]> {
    try {
      // Build base query
      const queryBuilder = this.buildQuoteSummaryQuery();

      // Apply status filter if provided
      if (status) {
        queryBuilder.where('quote.status = :status', { status });
      }

      // Execute query
      const quotes = await queryBuilder.getRawAndEntities();

      // Map results
      const result = this.mapToQuoteSummary(quotes);

      if (!result || result.length === 0) {
        const message = status
          ? `No quotes found for status: ${status}`
          : 'No quotes found';
        throw new NotFoundException(message);
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error fetching quotes');
    }
  }

  /**
   * Builds query builder base to get quote summary
   * @returns Configured QueryBuilder
   */
  private buildQuoteSummaryQuery() {
    return (
      this.quoteRepository
        .createQueryBuilder('quote')
        .leftJoinAndSelect('quote.customer', 'customer')
        .leftJoin('quote.details', 'detail')
        .leftJoin('detail.clothesVariant', 'variant')
        .select([
          // Quote fields
          'quote.id',
          'quote.total',
          'quote.customerId',
          'quote.status',
          'quote.createdAt',
          'quote.updatedAt',
          // Customer fields
          'customer.id',
          'customer.names',
          'customer.lastNames',
          'customer.phone',
        ])
        // Total unique base garments involved
        .addSelect('COUNT(DISTINCT variant.clothes_id)', 'totalClothes')
        // Total units to produce (sum of quantities)
        .addSelect('COALESCE(SUM(detail.quantity), 0)', 'totalUnitsToProduced')
        .groupBy('quote.id')
        .addGroupBy('customer.id')
        .orderBy('quote.createdAt', 'DESC')
    );
  }

  /**
   * Maps the results of the query to the QuoteSummary interface
   * @param quotes - Result of getRawAndEntities()
   * @returns Array of QuoteSummary
   */
  private mapToQuoteSummary(quotes: {
    entities: QuoteEntity[];
    raw: any[];
  }): QuoteSummary[] {
    return quotes.entities.map((quote, index) => ({
      id: quote.id,
      total: quote.total,
      customerId: quote.customerId,
      status: quote.status,
      createdAt: quote.createdAt,
      updatedAt: quote.updatedAt,
      customer: {
        id: quote.customer.id,
        names: quote.customer.names,
        lastNames: quote.customer.lastNames,
        phone: quote.customer.phone,
      },
      totalClothes: parseInt(quotes.raw[index].totalClothes) || 0,
      totalUnitsToProduced:
        parseInt(quotes.raw[index].totalUnitsToProduced) || 0,
    }));
  }

  private async getDetailUnitPrice(
    dto: CreateQuoteDTO,
  ): Promise<ClothesPrice[]> {
    const uniqueVariantsIds = [
      ...new Set(dto.details.map((d) => d.clothesVariantId)),
    ];
    const variants =
      await this.clothesVariantsService.getClothesVariantsByIdsArray(
        uniqueVariantsIds,
      );

    const clothesId = [...new Set(variants.map((v) => v.clothesId))];
    const clothes = await this.clothesService.getClothesByIdsArray(clothesId);
    const clothesMap = new Map(clothes.map((c) => [c.id, c]));

    const quantityMap = new Map(
      dto.details.map((d) => [d.clothesVariantId, d.quantity]),
    );

    const variantsPrice: ClothesPrice[] = variants.map((v) => {
      const clothe = clothesMap.get(v.clothesId);
      const basePrice = Number(clothe.price);
      const additionalPrice = Number(v.additional);
      const price = basePrice + additionalPrice;

      return {
        variantId: v.id,
        unitPrice: price,
        quantity: quantityMap.get(v.id),
      };
    });

    return variantsPrice;
  }

  private calculateTotal(variantsPrice: ClothesPrice[]): number {
    let total = 0;
    for (const vp of variantsPrice) {
      const unitPrice = Number(vp.unitPrice);
      total += unitPrice * vp.quantity;
    }
    return total;
  }

  /**
   * Validates that customizations array does not exceed quantity
   * @param details - Array of quote details to validate
   * @throws BadRequestException if customizations exceed quantity
   */
  private validateCustomizations(details: QuoteDetailDTO[]): void {
    for (const detail of details) {
      if (detail.customizations && detail.customizations.length > 0) {
        if (detail.customizations.length > detail.quantity) {
          throw new BadRequestException(
            `Detail for variant ${detail.clothesVariantId} has ${detail.customizations.length} customizations but quantity is only ${detail.quantity}. Customizations cannot exceed quantity.`,
          );
        }
      }
    }
  }

  /**
   * Validates that there are no duplicate variant IDs in quote details
   * @param details - Array of quote details to validate
   * @throws BadRequestException if duplicate variants are found
   */
  private validateNoDuplicateVariants(details: QuoteDetailDTO[]): void {
    const variantIds = details.map((d) => d.clothesVariantId);
    const uniqueVariantIds = new Set(variantIds);

    if (variantIds.length !== uniqueVariantIds.size) {
      // Find the duplicate variant IDs
      const duplicates = variantIds.filter(
        (id, index) => variantIds.indexOf(id) !== index,
      );
      throw new BadRequestException(
        `Duplicate variant IDs found in quote details: ${[...new Set(duplicates)].join(', ')}. Each variant can only appear once.`,
      );
    }
  }
}
