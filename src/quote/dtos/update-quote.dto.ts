import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { QuoteDetailDTO } from './create-quote.dto';

export class UpdateQuoteDTO {
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteDetailDTO)
  details: QuoteDetailDTO[];
}
