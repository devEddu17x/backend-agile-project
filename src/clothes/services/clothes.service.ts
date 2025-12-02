import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { ClothesEntity } from '../entities/clothes.entity';
import { CreateClothesDTO } from '../dto/create-clothes.dto';
import { ClothesVariantEntity } from '../entities/clothes-variant.entity';
import { SizeEntity } from '../entities/size.entity';
import { GenderEntity } from '../entities/gender.entity';
import { CreatedClothes } from '../interfaces/created-clothes.interface';
import { ClotheImageEntity } from '../entities/images.entity';
import { UpdateClothesDTO } from '../dto/update-clothes.dto';
import { Variant } from '../dto/variants.dto';
import { UpdateVariantDTO } from '../dto/update-variant.dto';
import { QuoteDetailEntity } from 'src/quote/entities/quote-detail.entity';
import { StorageService } from 'src/storage/storage.service';
import { AllowedImagesDTO } from '../dto/images.dto';

@Injectable()
export class ClothesService {
  constructor(
    @InjectRepository(ClothesEntity)
    private readonly clothesRepository: Repository<ClothesEntity>,
    @InjectRepository(ClothesVariantEntity)
    private readonly variantsRepository: Repository<ClothesVariantEntity>,
    @InjectRepository(SizeEntity)
    private readonly sizeRepository: Repository<SizeEntity>,
    @InjectRepository(GenderEntity)
    private readonly genderRepository: Repository<GenderEntity>,
    @InjectRepository(ClotheImageEntity)
    private readonly imageRepository: Repository<ClotheImageEntity>,
    @InjectRepository(QuoteDetailEntity)
    private readonly quoteDetailRepository: Repository<QuoteDetailEntity>,
    private readonly dataSource: DataSource,
    private readonly storageService: StorageService,
  ) {}

  async addNewClothesItem(clothes: CreateClothesDTO): Promise<CreatedClothes> {
    const { name, description, price, variants } = clothes;

    const variantKeys = new Set<string>();
    for (const v of variants) {
      const key = `${v.size}-${v.gender}`;
      if (variantKeys.has(key)) {
        throw new BadRequestException(
          `Duplicate combination of size and gender: ${v.size} - ${v.gender}`,
        );
      }
      variantKeys.add(key);
    }

    const uniqueSizes = [...new Set(variants.map((v) => v.size))];
    const uniqueGenders = [...new Set(variants.map((v) => v.gender))];

    const [sizes, genders] = await Promise.all([
      this.sizeRepository.find({ where: { size: In(uniqueSizes) } }),
      this.genderRepository.find({ where: { gender: In(uniqueGenders) } }),
    ]);

    const sizeIdByEnum = new Map(sizes.map((s) => [s.size, s.id]));
    const genderIdByEnum = new Map(genders.map((g) => [g.gender, g.id]));

    for (const v of variants) {
      if (!sizeIdByEnum.get(v.size))
        throw new BadRequestException(`Unknown size: ${v.size}`);
      if (!genderIdByEnum.get(v.gender))
        throw new BadRequestException(`Unknown gender: ${v.gender}`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const newClothe = await queryRunner.manager.save(
        ClothesEntity,
        this.clothesRepository.create({ name, description, price }),
      );
      const newVariants = variants.map((v) =>
        this.variantsRepository.create({
          clothesId: newClothe.id,
          sizeId: sizeIdByEnum.get(v.size)!,
          genderId: genderIdByEnum.get(v.gender)!,
          additional: v.additional,
        }),
      );
      const savedVariants: ClothesVariantEntity[] =
        await queryRunner.manager.save(ClothesVariantEntity, newVariants);
      await queryRunner.commitTransaction();
      return { ...newClothe, variants: savedVariants };
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Error creating the clothes item');
    } finally {
      await queryRunner.release();
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

  async getAllClothes(): Promise<any> {
    try {
      const clothes = await this.clothesRepository
        .createQueryBuilder('clothes')
        .leftJoinAndSelect('clothes.clothe_image', 'image')
        .select([
          'clothes.id',
          'clothes.name',
          'clothes.description',
          'clothes.price',
          'image.url',
        ])
        .getMany();
      return clothes;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error fetching clothes items');
    }
  }

  async getClothesById(clothesId: string): Promise<any> {
    let clothe = null;
    try {
      clothe = await this.clothesRepository
        .createQueryBuilder('clothes')
        .leftJoinAndSelect('clothes.clothes_variant', 'variant')
        .leftJoinAndSelect('variant.size', 'size')
        .leftJoinAndSelect('variant.gender', 'gender')
        .leftJoinAndSelect('clothes.clothe_image', 'image')
        .select([
          'clothes.id',
          'clothes.name',
          'clothes.description',
          'clothes.price',
          'clothes.createdAt',
          'clothes.updatedAt',

          'variant.additional',
          'variant.id',

          'size.size',

          'gender.gender',

          'image.url',
        ])
        .where('clothes.id = :clothesId', { clothesId })
        .getOne();
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error fetching the clothes item');
    }
    if (!clothe) {
      throw new NotFoundException('Clothes item not found');
    }
    return clothe;
  }

  async getClothesVariantsByIdsArray(
    clothesIds: string[],
  ): Promise<ClothesVariantEntity[]> {
    let clothes: ClothesVariantEntity[];
    try {
      clothes = await this.variantsRepository.find({
        where: { id: In(clothesIds) },
      });
    } catch (error) {
      throw new BadRequestException('Error retrieving clothes variants');
    }
    if (!clothes || clothes.length === 0) {
      throw new NotFoundException('No clothes variants found');
    }
    return clothes;
  }

  async getClothesByIdsArray(clothesIds: string[]): Promise<ClothesEntity[]> {
    let clothes: ClothesEntity[];
    try {
      clothes = await this.clothesRepository.find({
        where: { id: In(clothesIds) },
      });
    } catch (error) {
      throw new BadRequestException('Error retrieving clothes items');
    }
    return clothes;
  }

  async updateClothes(
    clothesId: string,
    updateData: UpdateClothesDTO,
  ): Promise<ClothesEntity> {
    const clothe = await this.clothesRepository.findOne({
      where: { id: clothesId },
    });

    if (!clothe) {
      throw new NotFoundException('Clothes item not found');
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No fields to update');
    }

    try {
      await this.clothesRepository.update(clothesId, updateData);

      return await this.clothesRepository.findOne({
        where: { id: clothesId },
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error updating clothes item');
    }
  }

  async addVariantToClothes(
    clothesId: string,
    variantData: Variant,
  ): Promise<ClothesVariantEntity> {
    const clothe = await this.clothesRepository.findOne({
      where: { id: clothesId },
    });

    if (!clothe) {
      throw new NotFoundException('Clothes item not found');
    }

    const [size, gender] = await Promise.all([
      this.sizeRepository.findOne({ where: { size: variantData.size } }),
      this.genderRepository.findOne({
        where: { gender: variantData.gender },
      }),
    ]);

    if (!size) {
      throw new BadRequestException(`Unknown size: ${variantData.size}`);
    }

    if (!gender) {
      throw new BadRequestException(`Unknown gender: ${variantData.gender}`);
    }

    const existingVariant = await this.variantsRepository.findOne({
      where: {
        clothesId: clothesId,
        sizeId: size.id,
        genderId: gender.id,
      },
    });

    if (existingVariant) {
      throw new BadRequestException(
        `Variant with size ${variantData.size} and gender ${variantData.gender} already exists for this clothes item`,
      );
    }

    try {
      const newVariant = this.variantsRepository.create({
        clothesId: clothesId,
        sizeId: size.id,
        genderId: gender.id,
        additional: variantData.additional,
      });

      return await this.variantsRepository.save(newVariant);
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error adding variant to clothes item');
    }
  }

  async updateVariant(
    clothesId: string,
    variantId: string,
    updateData: UpdateVariantDTO,
  ): Promise<ClothesVariantEntity> {
    const clothe = await this.clothesRepository.findOne({
      where: { id: clothesId },
    });

    if (!clothe) {
      throw new NotFoundException('Clothes item not found');
    }

    const variant = await this.variantsRepository.findOne({
      where: {
        id: variantId,
        clothesId: clothesId,
      },
    });

    if (!variant) {
      throw new NotFoundException(
        'Variant not found or does not belong to this clothes item',
      );
    }

    try {
      await this.variantsRepository.update(variantId, {
        additional: updateData.additional,
      });

      return await this.variantsRepository.findOne({
        where: { id: variantId },
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error updating variant');
    }
  }

  async deleteVariant(
    clothesId: string,
    variantId: string,
  ): Promise<{ message: string }> {
    const clothe = await this.clothesRepository.findOne({
      where: { id: clothesId },
    });

    if (!clothe) {
      throw new NotFoundException('Clothes item not found');
    }

    const variant = await this.variantsRepository.findOne({
      where: {
        id: variantId,
        clothesId: clothesId,
      },
    });

    if (!variant) {
      throw new NotFoundException(
        'Variant not found or does not belong to this clothes item',
      );
    }

    const quoteDetail = await this.quoteDetailRepository.findOne({
      where: { clothesVariantId: variantId },
    });

    if (quoteDetail) {
      throw new BadRequestException(
        'Cannot delete variant because it is associated with one or more quotes. You can only update the additional price.',
      );
    }

    try {
      await this.variantsRepository.delete(variantId);
      return {
        message: 'Variant deleted successfully',
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error deleting variant');
    }
  }

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
}
