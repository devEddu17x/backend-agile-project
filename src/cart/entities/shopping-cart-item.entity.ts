import { ClothesVariantEntity } from 'src/clothes/entities/clothes-variant.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ShoppingCartEntity } from './shopping-cart.entity';

@Entity('shopping_cart_item')
export class ShoppingCartItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'cart_id' })
  cartId: string;

  @ManyToOne(() => ShoppingCartEntity, (cart) => cart.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cart_id', referencedColumnName: 'id' })
  cart: ShoppingCartEntity;

  @Column('uuid', { name: 'clothes_variant_id' })
  clothesVariantId: string;

  @ManyToOne(() => ClothesVariantEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'clothes_variant_id', referencedColumnName: 'id' })
  clothesVariant: ClothesVariantEntity;

  @Column({ type: 'integer', nullable: false })
  quantity: number;

  /**
   * Snapshot of the base price at the time of adding to cart
   * Saved to maintain the original price even if it changes later
   */
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  priceSnapshot: number;

  /**
   * Snapshot of the variant's additional price at the time of adding to cart
   */
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  additionalSnapshot: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get subtotal(): number {
    return (
      (Number(this.priceSnapshot) + Number(this.additionalSnapshot)) *
      this.quantity
    );
  }
}
