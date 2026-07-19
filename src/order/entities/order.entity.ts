import { QuoteEntity } from 'src/quote/entities/quote.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AddressEntity } from './address.entity';
import { OrderStatus } from '../enum/order-status.enum';

@Entity('order')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  total: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.IN_PRODUCTION,
    nullable: false,
  })
  status: OrderStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'text', name: 'cancellation_reason', nullable: true })
  cancellationReason: string | null;

  @Column({ type: 'date', nullable: false })
  deliveryDate: Date;

  @Column('uuid', { name: 'quote_id' })
  quoteId: string;

  @ManyToOne(() => QuoteEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'quote_id', referencedColumnName: 'id' })
  quote: QuoteEntity;

  @Column('uuid', { name: 'address_id' })
  addressId: string;

  @OneToOne(() => AddressEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'address_id', referencedColumnName: 'id' })
  address: AddressEntity;
}
