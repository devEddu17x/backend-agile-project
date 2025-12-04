import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShoppingCartEntity } from './entities/shopping-cart.entity';
import { ShoppingCartItemEntity } from './entities/shopping-cart-item.entity';
import { AddItemToCartDTO } from './dtos/add-item-to-cart.dto';
import { UpdateCartItemDTO } from './dtos/update-cart-item.dto';
import { ClothesVariantEntity } from 'src/clothes/entities/clothes-variant.entity';
import { CartStatus } from './enums/cart-status.enum';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(ShoppingCartEntity)
    private readonly cartRepository: Repository<ShoppingCartEntity>,
    @InjectRepository(ShoppingCartItemEntity)
    private readonly cartItemRepository: Repository<ShoppingCartItemEntity>,
    @InjectRepository(ClothesVariantEntity)
    private readonly variantRepository: Repository<ClothesVariantEntity>,
  ) {}

  async getOrCreateCart(customerId: string): Promise<ShoppingCartEntity> {
    let cart = await this.cartRepository.findOne({
      where: {
        customerId,
        status: CartStatus.ACTIVE,
      },
      relations: [
        'items',
        'items.clothesVariant',
        'items.clothesVariant.clothes',
        'items.clothesVariant.clothes.clothe_image',
        'items.clothesVariant.size',
        'items.clothesVariant.gender',
      ],
    });

    if (!cart) {
      cart = this.cartRepository.create({
        customerId,
        status: CartStatus.ACTIVE,
      });
      cart = await this.cartRepository.save(cart);
      cart.items = [];
    }

    return cart;
  }

  async getCart(customerId: string) {
    const cart = await this.getOrCreateCart(customerId);

    const total = cart.items.reduce((sum, item) => sum + item.subtotal, 0);

    return {
      id: cart.id,
      items: cart.items.map((item) => ({
        id: item.id,
        clothes: {
          id: item.clothesVariant.clothes.id,
          name: item.clothesVariant.clothes.name,
          image: item.clothesVariant.clothes.clothe_image?.[0]?.url || null,
        },
        variant: {
          id: item.clothesVariant.id,
          size: item.clothesVariant.size.size,
          gender: item.clothesVariant.gender.gender,
          additional: item.additionalSnapshot,
        },
        quantity: item.quantity,
        unitPrice: item.priceSnapshot,
        subtotal: item.subtotal,
      })),
      total,
      itemCount: cart.items.length,
      isEmpty: cart.items.length === 0,
    };
  }

  async addItem(customerId: string, addItemDTO: AddItemToCartDTO) {
    const { clothesVariantId, quantity } = addItemDTO;

    const variant = await this.variantRepository.findOne({
      where: { id: clothesVariantId },
      relations: ['clothes', 'size', 'gender', 'clothes.clothe_image'],
    });

    if (!variant) {
      throw new NotFoundException('Selected variant does not exist');
    }

    if (!variant.clothes.isInEcommerce || variant.clothes.isDraft) {
      throw new BadRequestException('This item is not available for purchase');
    }

    const cart = await this.getOrCreateCart(customerId);

    const existingItem = cart.items.find(
      (item) => item.clothesVariantId === clothesVariantId,
    );

    let savedItem: ShoppingCartItemEntity;

    if (existingItem) {
      existingItem.quantity += quantity;
      savedItem = await this.cartItemRepository.save(existingItem);
    } else {
      const newItem = this.cartItemRepository.create({
        cartId: cart.id,
        clothesVariantId,
        quantity,
        priceSnapshot: variant.clothes.price,
        additionalSnapshot: variant.additional,
      });
      savedItem = await this.cartItemRepository.save(newItem);
    }

    return {
      id: savedItem.id,
      clothes: {
        id: variant.clothes.id,
        name: variant.clothes.name,
        image: variant.clothes.clothe_image?.[0]?.url || null,
      },
      variant: {
        id: variant.id,
        size: variant.size.size,
        gender: variant.gender.gender,
        additional: savedItem.additionalSnapshot,
      },
      quantity: savedItem.quantity,
      unitPrice: savedItem.priceSnapshot,
      subtotal: savedItem.subtotal,
    };
  }

  async updateItem(
    customerId: string,
    itemId: string,
    updateDTO: UpdateCartItemDTO,
  ) {
    const cart = await this.getOrCreateCart(customerId);

    const item = cart.items.find((i) => i.id === itemId);

    if (!item) {
      throw new NotFoundException('Item not found in cart');
    }

    item.quantity = updateDTO.quantity;
    const savedItem = await this.cartItemRepository.save(item);

    return {
      id: savedItem.id,
      clothes: {
        id: item.clothesVariant.clothes.id,
        name: item.clothesVariant.clothes.name,
        image: item.clothesVariant.clothes.clothe_image?.[0]?.url || null,
      },
      variant: {
        id: item.clothesVariant.id,
        size: item.clothesVariant.size.size,
        gender: item.clothesVariant.gender.gender,
        additional: savedItem.additionalSnapshot,
      },
      quantity: savedItem.quantity,
      unitPrice: savedItem.priceSnapshot,
      subtotal: savedItem.subtotal,
    };
  }

  async removeItem(customerId: string, itemId: string): Promise<void> {
    const cart = await this.getOrCreateCart(customerId);

    const item = cart.items.find((i) => i.id === itemId);

    if (!item) {
      throw new NotFoundException('Item not found in cart');
    }

    await this.cartItemRepository.remove(item);
  }

  async clearCart(customerId: string): Promise<void> {
    const cart = await this.getOrCreateCart(customerId);

    if (cart.items.length > 0) {
      await this.cartItemRepository.remove(cart.items);
    }
  }

  async markAsCheckedOut(customerId: string): Promise<void> {
    const cart = await this.cartRepository.findOne({
      where: {
        customerId,
        status: CartStatus.ACTIVE,
      },
    });

    if (cart) {
      cart.status = CartStatus.CHECKED_OUT;
      await this.cartRepository.save(cart);
    }
  }
}
