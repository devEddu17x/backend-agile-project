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
import { ClothesService } from 'src/clothes/clothes.service';
import { ClothesPrice } from './interfaces/clothes-price.interface';
import { QuoteStatus } from './enums/status.enum';

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

  async createQuote(dto: CreateQuoteDTO): Promise<any> {
    const customer = await this.customerService.getCustomerById(dto.customerId);
    const variantsPrice = await this.getDetailUnitPrice(dto);
    console.log(variantsPrice);
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

      console.log(newQuote);
      const detailsToSave = variantsPrice.map((vp) => {
        return this.quoteDetailRepository.create({
          quoteId: newQuote.id,
          unitPrice: vp.unitPrice,
          quantity: vp.quantity,
          clothesVariantId: vp.variantId,
        });
      });
      console.log(detailsToSave);
      const savedDetails = await queryRunner.manager.save(
        QuoteDetailEntity,
        detailsToSave,
      );
      await queryRunner.commitTransaction();
      return { ...newQuote, details: savedDetails };
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Error creating quote');
    } finally {
      await queryRunner.release();
    }
  }

  async getQuotesByStatus(status: QuoteStatus): Promise<QuoteEntity[]> {
    let quotes: QuoteEntity[] = [];
    try {
      quotes = await this.quoteRepository.find({
        where: { status },
        relations: { customer: true, details: true },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new BadRequestException('Error fetching quotes by status');
    }
    if (!quotes || quotes.length === 0) {
      throw new NotFoundException('No quotes found for the given status');
    }
    return quotes;
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
