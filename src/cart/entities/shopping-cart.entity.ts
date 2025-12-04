import { CustomerEntity } from 'src/customer/entities/customer.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ShoppingCartItemEntity } from './shopping-cart-item.entity';
import { CartStatus } from '../enums/cart-status.enum';

@Entity('shopping_cart')
export class ShoppingCartEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'customer_id' })
  customerId: string;

  @OneToOne(() => CustomerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id', referencedColumnName: 'id' })
  customer: CustomerEntity;

  @Column({
    type: 'enum',
    enum: CartStatus,
    default: CartStatus.ACTIVE,
  })
  status: CartStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ShoppingCartItemEntity, (item) => item.cart, {
    cascade: true,
  })
  items: ShoppingCartItemEntity[];
}
