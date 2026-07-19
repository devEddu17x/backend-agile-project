import { Module } from '@nestjs/common';
import { ClothesService } from './services/clothes.service';
import { ClothesController } from './clothes.controller';
import { ClothesEntity } from './entities/clothes.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClothesVariantEntity } from './entities/clothes-variant.entity';
import { GenderEntity } from './entities/gender.entity';
import { SizeEntity } from './entities/size.entity';
import { StorageModule } from 'src/storage/storage.module';
import { ClotheImageEntity } from './entities/images.entity';
import { QuoteDetailEntity } from 'src/quote/entities/quote-detail.entity';
import { ClothesVariantsService } from './services/clothes-variants.service';
import { ClothesImagesService } from './services/clothes-images.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GenderEntity,
      SizeEntity,
      ClothesEntity,
      ClothesVariantEntity,
      ClotheImageEntity,
      QuoteDetailEntity,
    ]),
    StorageModule,
  ],
  providers: [ClothesService, ClothesVariantsService, ClothesImagesService],
  controllers: [ClothesController],
  exports: [ClothesService, ClothesVariantsService, ClothesImagesService],
})
export class ClothesModule {}
