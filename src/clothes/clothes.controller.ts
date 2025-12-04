import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Session, SuperTokensAuthGuard } from 'supertokens-nestjs';
import { SessionContainer } from 'supertokens-node/recipe/session';
import { ClothesService } from './services/clothes.service';
import { CreateClothesDTO } from './dto/create-clothes.dto';
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
import { ClothesVariantsService } from './services/clothes-variants.service';
import { ClothesImagesService } from './services/clothes-images.service';
import { CreateDraftClothesDTO } from './dto/create-draft-clothes.dto';
import { UserContext } from 'src/auth/helpers/user-context.helper';
import { OptionalAuthGuard } from 'src/auth/guards/optional-auth.guard';

@Controller('clothes')
export class ClothesController {
  constructor(
    private readonly clothesService: ClothesService,
    private readonly clothesVariantService: ClothesVariantsService,
    private readonly clothesImagesService: ClothesImagesService,
    private readonly storageService: StorageService,
  ) {}

  @UseGuards(SuperTokensAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @Post()
  async createClothes(
    @Body() clothesDto: CreateClothesDTO,
  ): Promise<CreatedClothes & { preSignedPuts: PresignedPut[] }> {
    const createdClothes: CreatedClothes =
      await this.clothesService.createClothe(clothesDto);

    const preSignedPuts: PresignedPut[] | [] =
      await this.storageService.createPresignedPuts(
        createdClothes.id,
        clothesDto.images,
        { ttlSeconds: 3600, cacheControl: 'no-cache' },
      );

    const keys = preSignedPuts.map((put) => put.key);
    const imageUrls = this.storageService.getImagesUrl(keys);
    const savedImages = await this.clothesImagesService.addImagesToClothes(
      createdClothes.id,
      imageUrls,
    );
    if (!savedImages || savedImages.length === 0) {
      throw new Error('Failed to save image URLs to the database');
    }
    return { ...createdClothes, preSignedPuts };
  }

  @UseGuards(SuperTokensAuthGuard, RolesGuard)
  @Roles(ROLES.SELLER)
  @Post('quick-create')
  async createDraftClothes(
    @Body() draftClothesDto: CreateDraftClothesDTO,
  ): Promise<CreatedClothes & { preSignedPuts: PresignedPut[] }> {
    const createdClothes: CreatedClothes =
      await this.clothesService.createDraftClothe(draftClothesDto);

    const preSignedPuts: PresignedPut[] | [] =
      await this.storageService.createPresignedPuts(
        createdClothes.id,
        draftClothesDto.images,
        { ttlSeconds: 3600, cacheControl: 'no-cache' },
      );

    const keys = preSignedPuts.map((put) => put.key);
    const imageUrls = this.storageService.getImagesUrl(keys);
    const savedImages = await this.clothesImagesService.addImagesToClothes(
      createdClothes.id,
      imageUrls,
    );
    if (!savedImages || savedImages.length === 0) {
      throw new Error('Failed to save image URLs to the database');
    }
    return { ...createdClothes, preSignedPuts };
  }

  @UseGuards(OptionalAuthGuard)
  @Get()
  async getAllClothes(@Session() session?: SessionContainer): Promise<any> {
    const userContext = new UserContext(session);
    const filters = await userContext.getClothesFilterOptions();
    return this.clothesService.getAllClothes(filters);
  }

  @UseGuards(OptionalAuthGuard)
  @Get('search')
  async searchAndFilterClothes(
    @Query('name') name?: string,
    @Query('description') description?: string,
    @Query('size') size?: string,
    @Query('gender') gender?: string,
    @Session() session?: SessionContainer,
  ): Promise<any> {
    const userContext = new UserContext(session);
    const filters = await userContext.getClothesFilterOptions();
    return this.clothesService.searchAndFilterClothes(
      name,
      description,
      size,
      gender,
      filters,
    );
  }

  @UseGuards(OptionalAuthGuard)
  @Get(':id')
  async getClothesById(
    @Param('id', ParseUUIDPipe) clothesId: string,
    @Session() session?: SessionContainer,
  ): Promise<any> {
    const userContext = new UserContext(session);
    const filters = await userContext.getClothesFilterOptions();
    return this.clothesService.getClothesById(clothesId, filters);
  }

  @UseGuards(SuperTokensAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @Patch(':id')
  async updateClothes(
    @Param('id', ParseUUIDPipe) clothesId: string,
    @Body() updateClothesDto: UpdateClothesDTO,
  ): Promise<any> {
    return this.clothesService.updateClothes(clothesId, updateClothesDto);
  }

  @UseGuards(SuperTokensAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @Post(':id/variants')
  async addVariant(
    @Param('id', ParseUUIDPipe) clothesId: string,
    @Body() variantDto: Variant,
  ): Promise<any> {
    return this.clothesVariantService.addVariantToClothes(
      clothesId,
      variantDto,
    );
  }

  @UseGuards(SuperTokensAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @Patch(':id/variants/:variantId')
  async updateVariant(
    @Param('id', ParseUUIDPipe) clothesId: string,
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Body() updateVariantDto: UpdateVariantDTO,
  ): Promise<any> {
    return this.clothesVariantService.updateVariant(
      clothesId,
      variantId,
      updateVariantDto,
    );
  }

  @UseGuards(SuperTokensAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @Delete(':id/variants/:variantId')
  async deleteVariant(
    @Param('id', ParseUUIDPipe) clothesId: string,
    @Param('variantId', ParseUUIDPipe) variantId: string,
  ): Promise<any> {
    return this.clothesVariantService.deleteVariant(clothesId, variantId);
  }

  @UseGuards(SuperTokensAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @Post(':id/images')
  async addImages(
    @Param('id', ParseUUIDPipe) clothesId: string,
    @Body() addImagesDto: AddImagesToClothesDTO,
  ): Promise<any> {
    return this.clothesImagesService.addNewImagesToClothes(
      clothesId,
      addImagesDto.images,
    );
  }

  @UseGuards(SuperTokensAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @Delete(':id/images')
  async deleteImage(
    @Param('id', ParseUUIDPipe) clothesId: string,
    @Body() deleteImageDto: DeleteImageDTO,
  ): Promise<any> {
    return this.clothesImagesService.deleteImageFromClothes(
      clothesId,
      deleteImageDto.url,
    );
  }
}
