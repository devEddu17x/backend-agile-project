import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClothesEntity } from './clothes.entity';

@Entity('clothe_image')
export class ClotheImageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @Column('uuid', { name: 'clothes_id' })
  clothesId: string;

  @ManyToOne(() => ClothesEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clothes_id', referencedColumnName: 'id' })
  clothes: ClothesEntity;
}
