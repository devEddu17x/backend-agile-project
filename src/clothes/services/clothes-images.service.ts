import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AllowedImagesDTO } from '../dto/images.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { StorageService } from 'src/storage/storage.service';
import { Repository } from 'typeorm';
import { ClotheImageEntity } from '../entities/images.entity';
import { ClothesEntity } from '../entities/clothes.entity';

@Injectable()
export class ClothesImagesService {
  constructor(
    @InjectRepository(ClothesEntity)
    private readonly clothesRepository: Repository<ClothesEntity>,
    @InjectRepository(ClotheImageEntity)
    private readonly imageRepository: Repository<ClotheImageEntity>,
    private readonly storageService: StorageService,
  ) {}
  async addNewImagesToClothes(
    clothesId: string,
    images: AllowedImagesDTO[],
  ): Promise<{ imageUrls: string[]; preSignedPuts: any[] }> {
    const clothe = await this.clothesRepository.findOne({
      where: { id: clothesId },
    });

    if (!clothe) {
      throw new NotFoundException('Clothes item not found');
    }

    try {
      const preSignedPuts = await this.storageService.createPresignedPuts(
        clothesId,
        images,
        {
          ttlSeconds: 3600,
          cacheControl: 'no-cache',
        },
      );

      const keys = preSignedPuts.map((put) => put.key);
      const imageUrls = this.storageService.getImagesUrl(keys);

      const savedImages = await this.addImagesToClothes(clothesId, imageUrls);

      if (!savedImages || savedImages.length === 0) {
        throw new BadRequestException('Error saving images');
      }

      return {
        imageUrls,
        preSignedPuts,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error adding images to clothes item');
    }
  }

  async deleteImageFromClothes(
    clothesId: string,
    imageUrl: string,
  ): Promise<{ message: string }> {
    const clothe = await this.clothesRepository.findOne({
      where: { id: clothesId },
    });

    if (!clothe) {
      throw new NotFoundException('Clothes item not found');
    }

    const image = await this.imageRepository.findOne({
      where: {
        url: imageUrl,
        clothesId: clothesId,
      },
    });

    if (!image) {
      throw new NotFoundException(
        'Image not found or does not belong to this clothes item',
      );
    }

    try {
      const key = this.storageService.extractKeyFromUrl(imageUrl);

      if (!key) {
        throw new BadRequestException('Invalid image URL');
      }

      const deleted = await this.storageService.deleteObject(key);

      if (!deleted) {
        console.warn(`Failed to delete image from S3: ${key}`);
      }

      await this.imageRepository.delete(image.id);

      return {
        message: 'Image deleted successfully',
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error deleting image');
    }
  }

  async addImagesToClothes(
    clothesId: string,
    imageUrls: string[],
  ): Promise<ClotheImageEntity[]> {
    const clothe = await this.clothesRepository.findOne({
      where: { id: clothesId },
    });
    if (!clothe) {
      throw new BadRequestException('Clothes item not found');
    }
    const newImages = imageUrls.map((url) =>
      this.imageRepository.create({ url, clothesId }),
    );
    const savedImages = await this.imageRepository.save(newImages);
    if (!savedImages || savedImages.length === 0) {
      throw new BadRequestException('Error saving images');
    }
    return savedImages;
  }
}
