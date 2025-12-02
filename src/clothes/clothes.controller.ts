import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClothesService } from './services/clothes.service';
import { CreateClothesDTO } from './dto/create-clothes.dto';
import { SuperTokensAuthGuard } from 'supertokens-nestjs';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ROLES } from 'src/auth/constants/roles';
import { CreatedClothes } from './interfaces/created-clothes.interface';
import { StorageService } from 'src/storage/storage.service';
import { PresignedPut } from 'src/storage/interfaces/presigned-url.interface';
import { UpdateClothesDTO } from './dto/update-clothes.dto';
import { Variant } from './dto/variants.dto';
import { UpdateVariantDTO } from './dto/update-variant.dto';
import { AddImagesToClothesDTO } from './dto/add-images.dto';
import { DeleteImageDTO } from './dto/delete-image.dto';

@UseGuards(SuperTokensAuthGuard, RolesGuard)
@Controller('clothes')
export class ClothesController {
  constructor(
    private readonly clothesService: ClothesService,
    private readonly storageService: StorageService,
  ) {}

  @Roles(ROLES.ADMIN)
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

  @Get()
  async getAllClothes(): Promise<any> {
    return this.clothesService.getAllClothes();
  }

  @Get(':id')
  async getClothesById(
    @Param('id', ParseUUIDPipe) clothesId: string,
  ): Promise<any> {
    return this.clothesService.getClothesById(clothesId);
  }

  @Roles(ROLES.ADMIN)
  @Patch(':id')
  async updateClothes(
    @Param('id', ParseUUIDPipe) clothesId: string,
    @Body() updateClothesDto: UpdateClothesDTO,
  ): Promise<any> {
    return this.clothesService.updateClothes(clothesId, updateClothesDto);
  }

  @Roles(ROLES.ADMIN)
  @Post(':id/variants')
  async addVariant(
    @Param('id', ParseUUIDPipe) clothesId: string,
    @Body() variantDto: Variant,
  ): Promise<any> {
    return this.clothesService.addVariantToClothes(clothesId, variantDto);
  }

  @Roles(ROLES.ADMIN)
  @Patch(':id/variants/:variantId')
  async updateVariant(
    @Param('id', ParseUUIDPipe) clothesId: string,
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Body() updateVariantDto: UpdateVariantDTO,
  ): Promise<any> {
    return this.clothesService.updateVariant(
      clothesId,
      variantId,
      updateVariantDto,
    );
  }

  @Roles(ROLES.ADMIN)
  @Delete(':id/variants/:variantId')
  async deleteVariant(
    @Param('id', ParseUUIDPipe) clothesId: string,
    @Param('variantId', ParseUUIDPipe) variantId: string,
  ): Promise<any> {
    return this.clothesService.deleteVariant(clothesId, variantId);
  }

  @Roles(ROLES.ADMIN)
  @Post(':id/images')
  async addImages(
    @Param('id', ParseUUIDPipe) clothesId: string,
    @Body() addImagesDto: AddImagesToClothesDTO,
  ): Promise<any> {
    return this.clothesService.addNewImagesToClothes(
      clothesId,
      addImagesDto.images,
    );
  }

  @Roles(ROLES.ADMIN)
  @Delete(':id/images')
  async deleteImage(
    @Param('id', ParseUUIDPipe) clothesId: string,
    @Body() deleteImageDto: DeleteImageDTO,
  ): Promise<any> {
    return this.clothesService.deleteImageFromClothes(
      clothesId,
      deleteImageDto.url,
    );
  }
}
