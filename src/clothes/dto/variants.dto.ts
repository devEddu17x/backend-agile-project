import { IsNotEmpty, IsEnum, IsNumber, Min } from 'class-validator';
import { CLOTHES_GENDER } from '../enum/gender.enum';
import { CLOTHES_SIZES } from '../enum/size.enum';

export class Variant {
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
