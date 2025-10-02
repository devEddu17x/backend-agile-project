import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ClothesEntity } from './clothes.entity';

@Entity('clothe_image')
export class ClotheImageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @ManyToOne(() => ClothesEntity, (clothes) => clothes.images)
  clothes: ClothesEntity;
}
