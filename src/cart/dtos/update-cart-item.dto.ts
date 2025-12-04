import { IsInt, Min } from 'class-validator';

export class UpdateCartItemDTO {
  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Minimum quantity is 1' })
  quantity: number;
}
