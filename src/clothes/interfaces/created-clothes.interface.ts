import { ClothesEntity } from '../entities/clothes.entity';
import { ClothesVariantEntity } from '../entities/clothes-variant.entity';

export interface CreatedClothes extends ClothesEntity {
  variants: ClothesVariantEntity[];
}
