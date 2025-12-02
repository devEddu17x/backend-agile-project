import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AllowedImagesDTO } from './images.dto';

export class AddImagesToClothesDTO {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AllowedImagesDTO)
  images: AllowedImagesDTO[];
}
