import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDTO } from './dtos/create-order.dto';
import { SuperTokensAuthGuard } from 'supertokens-nestjs';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ROLES } from 'src/auth/constants/roles';
import { UpdateOrderDTO } from './dtos/update-order.dto';

@Roles(ROLES.SELLER)
@UseGuards(SuperTokensAuthGuard, RolesGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Body() dto: CreateOrderDTO) {
    return await this.orderService.createOrder(dto);
  }

  @Get()
  async getOrders() {
    return await this.orderService.getOrders();
  }

  @Get(':id')
  async getOrderById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.orderService.getOrderById(id);
  }

  @Patch(':id')
  async updateOrderStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderDTO,
  ) {
    return await this.orderService.updateOrderStatus(id, dto.status);
  }
}
