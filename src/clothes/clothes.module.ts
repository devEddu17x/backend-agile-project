import { Module } from '@nestjs/common';
import { ClothesService } from './clothes.service';
import { ClothesController } from './clothes.controller';
import { ClothesEntity } from './entities/clothes.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClothesVariantEntity } from './entities/clothes-variant.entity';
import { GenderEntity } from './entities/gender.entity';
import { SizeEntity } from './entities/size.entity';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GenderEntity,
      SizeEntity,
      ClothesEntity,
      ClothesVariantEntity,
    ]),
    StorageModule,
  ],
  providers: [ClothesService],
  controllers: [ClothesController],
})
export class ClothesModule {}
