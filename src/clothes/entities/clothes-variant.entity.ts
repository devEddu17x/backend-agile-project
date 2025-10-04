import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ClothesEntity } from './clothes.entity';
import { GenderEntity } from './gender.entity';
import { SizeEntity } from './size.entity';

@Entity('clothes_variant')
export class ClothesVariantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'clothes_id' })
  clothesId: string;

  @ManyToOne(() => ClothesEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clothes_id', referencedColumnName: 'id' })
  clothes: ClothesEntity;

  @Column('uuid', { name: 'size_id' })
  sizeId: string;

  @ManyToOne(() => SizeEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'size_id', referencedColumnName: 'id' })
  size: SizeEntity;

  @Column('uuid', { name: 'gender_id' })
  genderId: string;

  @ManyToOne(() => GenderEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'gender_id', referencedColumnName: 'id' })
  gender: GenderEntity;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  additional: number;
}
