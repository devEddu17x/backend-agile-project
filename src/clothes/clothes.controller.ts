import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ClothesService } from './clothes.service';
import { CreateClothesDTO } from './dto/create-clothes.dto';
import { SuperTokensAuthGuard } from 'supertokens-nestjs';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ROLES } from 'src/auth/constants/roles';
import { CreatedClothes } from './interfaces/created-clothes.interface';
import { StorageService } from 'src/storage/storage.service';
import { PresignedPut } from 'src/storage/interfaces/presigned-url.interface';

@Roles(ROLES.ADMIN)
@UseGuards(SuperTokensAuthGuard, RolesGuard)
@Controller('clothes')
export class ClothesController {
  constructor(
    private readonly clothesService: ClothesService,
    private readonly storageService: StorageService,
  ) {}
  @Post()
  async createClothes(
    @Body() clothesDto: CreateClothesDTO,
  ): Promise<CreatedClothes & { preSignedPuts: PresignedPut[] }> {
    const createdClothes: CreatedClothes =
      await this.clothesService.addNewClothesItem(clothesDto);

    const preSignedPuts: PresignedPut[] | [] =
      await this.storageService.createPresignedPuts(
        createdClothes.id,
        clothesDto.images,
        { ttlSeconds: 3600, cacheControl: 'no-cache' },
      );

    const keys = preSignedPuts.map((put) => put.key);
    const imageUrls = this.storageService.getImagesUrl(keys);
    const savedImages = await this.clothesService.addImagesToClothes(
      createdClothes.id,
      imageUrls,
    );
    if (!savedImages || savedImages.length === 0) {
      throw new Error('Failed to save image URLs to the database');
    }
    return { ...createdClothes, preSignedPuts };
  }
}
