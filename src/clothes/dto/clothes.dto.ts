import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  Min,
  IsEnum,
} from 'class-validator';
import { Gender } from '../enum/gender.enum';
import { ClothesSize } from '../enum/size.enum';

export class CreateClothesDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  price: number;

  @IsNotEmpty()
  @IsString()
  @IsEnum(Gender)
  genre: Gender;

  @IsNotEmpty()
  @IsEnum(ClothesSize)
  size: ClothesSize;
}
