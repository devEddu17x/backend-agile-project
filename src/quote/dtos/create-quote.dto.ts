import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class CustomizationDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  number?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateQuoteDTO {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteDetailDTO)
  details: QuoteDetailDTO[];

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  customerId: string;
}

export class QuoteDetailDTO {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  clothesVariantId: string;

  @IsNotEmpty()
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'quantity must be a number' },
  )
  @IsInt({ message: 'quantity must be an integer' })
  @Min(1, { message: 'quantity must be at least 1' })
  quantity: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomizationDTO)
  @ArrayMaxSize(100, {
    message: 'customizations array cannot have more than 100 items',
  })
  customizations?: CustomizationDTO[];
}
