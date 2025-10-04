import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ClothesVariantEntity } from './clothes-variant.entity';
import { ClotheImageEntity } from './images.entity';

@Entity('clothes')
export class ClothesEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ClothesVariantEntity, (variant) => variant.clothes)
  clothes_variant: ClothesVariantEntity[];

  @OneToMany(() => ClotheImageEntity, (image) => image.clothes)
  clothe_image: ClotheImageEntity[];
}
