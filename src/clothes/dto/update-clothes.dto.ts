import {
  IsString,
  IsNumber,
  Min,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class UpdateClothesDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsBoolean()
  isInEcommerce?: boolean;

  @IsOptional()
  @IsBoolean()
  isDraft?: boolean;
}
