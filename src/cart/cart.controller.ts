import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Session, SuperTokensAuthGuard } from 'supertokens-nestjs';
import { SessionContainer } from 'supertokens-node/recipe/session';
import { CartService } from './cart.service';
import { AddItemToCartDTO } from './dtos/add-item-to-cart.dto';
import { UpdateCartItemDTO } from './dtos/update-cart-item.dto';
import { CustomerEcommerceService } from 'src/customer/services/customer-ecommerce.service';

@UseGuards(SuperTokensAuthGuard)
@Controller('cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly customerService: CustomerEcommerceService,
  ) {}

  @Get()
  async getCart(@Session() session: SessionContainer) {
    const superTokensId = session.getUserId();
    const customer =
      await this.customerService.getCustomerBySuperTokensId(superTokensId);
    return this.cartService.getCart(customer.id);
  }

  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  async addItem(
    @Session() session: SessionContainer,
    @Body() addItemDTO: AddItemToCartDTO,
  ) {
    const superTokensId = session.getUserId();
    const customer =
      await this.customerService.getCustomerBySuperTokensId(superTokensId);

    return this.cartService.addItem(customer.id, addItemDTO);
  }

  @Patch('items/:itemId')
  async updateItem(
    @Session() session: SessionContainer,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() updateDTO: UpdateCartItemDTO,
  ) {
    const superTokensId = session.getUserId();
    const customer =
      await this.customerService.getCustomerBySuperTokensId(superTokensId);

    return this.cartService.updateItem(customer.id, itemId, updateDTO);
  }

  @Delete('items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeItem(
    @Session() session: SessionContainer,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    const superTokensId = session.getUserId();
    const customer =
      await this.customerService.getCustomerBySuperTokensId(superTokensId);

    await this.cartService.removeItem(customer.id, itemId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearCart(@Session() session: SessionContainer) {
    const superTokensId = session.getUserId();
    const customer =
      await this.customerService.getCustomerBySuperTokensId(superTokensId);

    await this.cartService.clearCart(customer.id);
  }
}
