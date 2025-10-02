import {
  IsString,
  IsNumber,
  IsNotEmpty,
  Min,
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

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
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
