import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { OrderStatus } from '../enum/order-status.enum';

export class UpdateOrderDTO {
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsNotEmpty()
  @IsEnum(OrderStatus, {
    message: `status must be one of: ${Object.values(OrderStatus).join(', ')}`,
  })
  status: OrderStatus;
}
