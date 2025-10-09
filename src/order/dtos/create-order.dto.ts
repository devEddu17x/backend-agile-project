import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class AddressDTO {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  department: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  city: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  district: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  street: string;
}

export class CreateOrderDTO {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  quoteId: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AddressDTO)
  address: AddressDTO;

  @IsNotEmpty()
  @IsDateString({}, { message: 'deliveryDate must be a valid date' })
  deliveryDate: string;
}
