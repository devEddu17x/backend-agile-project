import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { QuoteModule } from 'src/quote/quote.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './entities/order.entity';
import { AddressEntity } from './entities/address.entity';
import { ClothesModule } from 'src/clothes/clothes.module';

@Module({
  imports: [
    QuoteModule,
    ClothesModule,
    TypeOrmModule.forFeature([OrderEntity, AddressEntity]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
