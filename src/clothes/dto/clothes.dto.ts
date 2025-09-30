import {
  IsString,
  IsNumber,
  IsNotEmpty,
  Min,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { CLOTHES_GENDER } from '../enum/gender.enum';
import { CLOTHES_SIZES } from '../enum/size.enum';

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
  variants: Variant[];
}

class Variant {
  @IsNotEmpty()
  @IsEnum(CLOTHES_GENDER)
  gender: CLOTHES_GENDER;

  @IsNotEmpty()
  @IsEnum(CLOTHES_SIZES)
  size: CLOTHES_SIZES;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  additional: number;
}
