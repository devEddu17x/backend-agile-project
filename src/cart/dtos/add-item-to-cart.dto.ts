import { IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class AddItemToCartDTO {
  @IsUUID(4, { message: 'Variant ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Variant ID is required' })
  clothesVariantId: string;

  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Minimum quantity is 1' })
  quantity: number;
}
