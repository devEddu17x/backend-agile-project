import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ALLOWED_IMAGES } from 'src/clothes/enum/allowed-images.enum';

export class AllowedImagesDTO {
  @IsNotEmpty()
  @IsString()
  filename: string;
  @IsNotEmpty()
  @IsEnum(ALLOWED_IMAGES)
  contentType: ALLOWED_IMAGES;
}
