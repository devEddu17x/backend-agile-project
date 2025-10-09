import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuoteEntity } from './quote.entity';
import { ClothesVariantEntity } from 'src/clothes/entities/clothes-variant.entity';

@Entity('quote_detail')
export class QuoteDetailEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  unitPrice: number;

  @Column({ type: 'int', nullable: false, default: 1 })
  quantity: number;

  @Column('uuid', { name: 'quote_id' })
  quoteId: string;

  @ManyToOne(() => QuoteEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quote_id', referencedColumnName: 'id' })
  quote: QuoteEntity;

  @Column('uuid', { name: 'clothes_variant_id' })
  clothesVariantId: string;

  @ManyToOne(() => ClothesVariantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clothes_variant_id', referencedColumnName: 'id' })
  clothesVariant: ClothesVariantEntity;
}
