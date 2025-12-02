import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class DeleteImageDTO {
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  url: string;
}
