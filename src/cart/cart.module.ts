import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { ShoppingCartEntity } from './entities/shopping-cart.entity';
import { ShoppingCartItemEntity } from './entities/shopping-cart-item.entity';
import { ClothesVariantEntity } from 'src/clothes/entities/clothes-variant.entity';
import { ClothesEntity } from 'src/clothes/entities/clothes.entity';
import { CustomerModule } from 'src/customer/customer.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ShoppingCartEntity,
      ShoppingCartItemEntity,
      ClothesVariantEntity,
      ClothesEntity,
    ]),
    CustomerModule,
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
