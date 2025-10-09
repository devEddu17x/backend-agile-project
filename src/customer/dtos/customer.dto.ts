import {
  IsNotEmpty,
  IsString,
  MaxLength,
  Length,
  IsOptional,
} from 'class-validator';

export class CreateCustomerDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  names: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastNames: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  reference: string;

  @IsString()
  @Length(9)
  phone: string;
}
