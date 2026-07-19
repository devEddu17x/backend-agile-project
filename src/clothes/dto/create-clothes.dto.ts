import {
  IsString,
  IsNumber,
  IsNotEmpty,
  Min,
  Max,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Variant } from './variants.dto';
import { AllowedImagesDTO } from 'src/clothes/dto/images.dto';

export class CreateClothesDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Price must have at most 2 decimal places' },
  )
  @Min(0, { message: 'Price must be greater than or equal to 0' })
  @Max(1000, { message: 'Price must be less than or equal to 1000' })
  price: number;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Variant)
  variants: Variant[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AllowedImagesDTO)
  images: AllowedImagesDTO[];
}
