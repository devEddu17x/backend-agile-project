import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CancelOrderDTO {
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  reason: string;
}
