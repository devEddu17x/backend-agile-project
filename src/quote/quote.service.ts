import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuoteEntity } from './entities/quote.entity';
import { Repository } from 'typeorm/repository/Repository';
import { QuoteDetailEntity } from './entities/quote-detail.entity';
import { CreateQuoteDTO } from './dtos/create-quote.dto';
import { CustomerService } from 'src/customer/customer.service';
import { DataSource } from 'typeorm';
import { ClothesService } from 'src/clothes/services/clothes.service';
import { ClothesPrice } from './interfaces/clothes-price.interface';
import { QuoteStatus } from './enums/status.enum';
import { QuoteSummary } from './interfaces/clothes-data.interface';
import { CreatedClothes } from './interfaces/created-clothes.interface';
import { UpdateQuoteDTO } from './dtos/update-quote.dto';

@Injectable()
export class QuoteService {
  constructor(
    @InjectRepository(QuoteEntity)
    private readonly quoteRepository: Repository<QuoteEntity>,
    @InjectRepository(QuoteDetailEntity)
    private readonly quoteDetailRepository: Repository<QuoteDetailEntity>,
    private readonly customerService: CustomerService,
    private readonly clothesService: ClothesService,
    private readonly dataSource: DataSource,
  ) {}

  async createQuote(dto: CreateQuoteDTO): Promise<CreatedClothes> {
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
        return this.quoteDetailRepository.create({
          quoteId: newQuote.id,
          unitPrice: vp.unitPrice,
          quantity: vp.quantity,
          clothesVariantId: vp.variantId,
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

  async updateQuote(dto: UpdateQuoteDTO): Promise<CreatedClothes> {
    // Verificar que la cotización existe
    const existingQuote = await this.quoteRepository.findOne({
      where: { id: dto.id },
      relations: ['customer'],
    });

    if (!existingQuote) {
      throw new NotFoundException(`Quote with ID ${dto.id} not found`);
    }

    // Calcular precios de las nuevas variantes (reutiliza lógica de createQuote)
    const variantsPrice = await this.getDetailUnitPrice({
      details: dto.details,
      customerId: existingQuote.customerId, // Necesario para la validación
    } as CreateQuoteDTO);

    const newTotal = this.calculateTotal(variantsPrice);

    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // 1. Eliminar todos los detalles existentes
      await queryRunner.manager.delete(QuoteDetailEntity, {
        quoteId: dto.id,
      });

      // 2. Actualizar el total de la cotización
      await queryRunner.manager.update(
        QuoteEntity,
        { id: dto.id },
        { total: newTotal },
      );

      // 3. Crear los nuevos detalles
      const newDetailsToSave = variantsPrice.map((vp) => {
        return this.quoteDetailRepository.create({
          quoteId: dto.id,
          unitPrice: vp.unitPrice,
          quantity: vp.quantity,
          clothesVariantId: vp.variantId,
        });
      });

      const savedDetails = await queryRunner.manager.save(
        QuoteDetailEntity,
        newDetailsToSave,
      );

      await queryRunner.commitTransaction();

      // 4. Obtener la cotización actualizada con todos sus datos
      const updatedQuote = await this.quoteRepository.findOne({
        where: { id: dto.id },
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
      await this.clothesService.getClothesVariantsByIdsArray(uniqueVariantsIds);

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
}
