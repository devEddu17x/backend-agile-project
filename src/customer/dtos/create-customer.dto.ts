import {
  IsNotEmpty,
  IsString,
  MaxLength,
  Length,
  IsOptional,
  Matches,
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
  @Length(9, 9)
  @Matches(/^9\d{8}$/, {
    message:
      'phone must be a valid Peruvian phone number (9 digits starting with 9)',
  })
  phone: string;
}
