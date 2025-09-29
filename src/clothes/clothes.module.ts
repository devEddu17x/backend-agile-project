import { Module } from '@nestjs/common';
import { ClothesService } from './clothes.service';
import { ClothesController } from './clothes.controller';
import { ClothesEntity } from './entities/clothes.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ClothesEntity])],
  providers: [ClothesService],
  controllers: [ClothesController],
})
export class ClothesModule {}
