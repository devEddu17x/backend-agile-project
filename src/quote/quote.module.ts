import { Module } from '@nestjs/common';
import { QuoteService } from './quote.service';
import { CustomerModule } from 'src/customer/customer.module';
import { ClothesModule } from 'src/clothes/clothes.module';
import { QuoteController } from './quote.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuoteDetailEntity } from './entities/quote-detail.entity';
import { QuoteEntity } from './entities/quote.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([QuoteEntity, QuoteDetailEntity]),
    CustomerModule,
    ClothesModule,
  ],
  providers: [QuoteService],
  controllers: [QuoteController],
  exports: [QuoteService],
})
export class QuoteModule {}
