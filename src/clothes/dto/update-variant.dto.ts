import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class UpdateVariantDTO {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  additional: number;
}
