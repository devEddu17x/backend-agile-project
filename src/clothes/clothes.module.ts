import { Module } from '@nestjs/common';
import { ClothesService } from './clothes.service';
import { ClothesController } from './clothes.controller';
import { ClothesEntity } from './entities/clothes.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClothesVariantEntity } from './entities/clothes-variant.entity';
import { GenderEntity } from './entities/gender.entity';
import { SizeEntity } from './entities/size.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GenderEntity,
      SizeEntity,
      ClothesEntity,
      ClothesVariantEntity,
    ]),
  ],
  providers: [ClothesService],
  controllers: [ClothesController],
})
export class ClothesModule {}
