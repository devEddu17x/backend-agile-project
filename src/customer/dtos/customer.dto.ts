import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCustomerDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  names: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastNames: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  reference: string;

  @Type(() => Number)
  @IsInt()
  @Min(100000000, { message: 'Phone number must be at least 9 digits' })
  @Max(999999999, { message: 'Phone number must be at most 9 digits' })
  phone: number;
}
