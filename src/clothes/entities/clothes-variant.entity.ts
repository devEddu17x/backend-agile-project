import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { ClothesEntity } from './clothes.entity';
import { GenderEntity } from './gender.entity';
import { SizeEntity } from './size.entity';

@Entity('clothes_variant')
export class ClothesVariantEntity {
  @PrimaryColumn('uuid', { name: 'clothes_id' })
  clothesId: string;

  @ManyToOne(() => ClothesEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clothes_id', referencedColumnName: 'id' })
  clothes: ClothesEntity;

  @PrimaryColumn('uuid', { name: 'size_id' })
  sizeId: string;

  @ManyToOne(() => SizeEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'size_id', referencedColumnName: 'id' })
  size: SizeEntity;

  @PrimaryColumn('uuid', { name: 'gender_id' })
  genderId: string;

  @ManyToOne(() => GenderEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'gender_id', referencedColumnName: 'id' })
  gender: GenderEntity;

  @Column({ type: 'text', nullable: true })
  additional?: string | null;
}
