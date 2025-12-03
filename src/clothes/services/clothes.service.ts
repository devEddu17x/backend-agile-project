import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Equal, In, Repository } from 'typeorm';
import { ClothesEntity } from '../entities/clothes.entity';
import { CreateClothesDTO } from '../dto/create-clothes.dto';
import { ClothesVariantEntity } from '../entities/clothes-variant.entity';
import { SizeEntity } from '../entities/size.entity';
import { GenderEntity } from '../entities/gender.entity';
import { CreatedClothes } from '../interfaces/created-clothes.interface';
import { ClotheImageEntity } from '../entities/images.entity';
import { UpdateClothesDTO } from '../dto/update-clothes.dto';
import { QuoteDetailEntity } from 'src/quote/entities/quote-detail.entity';
import { StorageService } from 'src/storage/storage.service';
import { CreateDraftClothesDTO } from '../dto/create-draft-clothes.dto';
import { CLOTHES_GENDER } from '../enum/gender.enum';
import { CLOTHES_SIZES } from '../enum/size.enum';

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

  async createClothe(clothes: CreateClothesDTO): Promise<CreatedClothes> {
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

  async createDraftClothe(
    clothes: CreateDraftClothesDTO,
  ): Promise<CreatedClothes> {
    const { name, price } = clothes;
    const newClothe = this.clothesRepository.create({
      name,
      price,
      isDraft: true,
      isInEcommerce: false,
    });

    const [gender, size] = await Promise.all([
      this.genderRepository.findOne({
        where: {
          gender: Equal(CLOTHES_GENDER.UNISEX),
        },
      }),
      this.sizeRepository.findOne({
        where: {
          size: Equal(CLOTHES_SIZES.M),
        },
      }),
    ]);

    try {
      const savedClothe = await this.clothesRepository.save(newClothe);
      const newVariant = this.variantsRepository.create({
        clothesId: savedClothe.id,
        additional: 0,
        genderId: gender.id,
        sizeId: size.id,
      });
      const savedVariant = await this.variantsRepository.save(newVariant);
      return { ...savedClothe, variants: [savedVariant] };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error creating draft clothes item');
    }
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
          'clothes.isDraft',
          'clothes.isInEcommerce',
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

  async searchAndFilterClothes(
    name?: string,
    description?: string,
    size?: string,
    gender?: string,
  ): Promise<any[]> {
    try {
      let query = this.clothesRepository
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
          'clothes.isInEcommerce',
          'variant.id',
          'variant.additional',
          'size.size',
          'gender.gender',
          'image.url',
        ]);

      let hasCondition = false;

      if (name && name.trim() !== '') {
        query = query.where('clothes.name ILIKE :name', {
          name: `%${name.trim()}%`,
        });
        hasCondition = true;
      }

      if (description && description.trim() !== '') {
        if (hasCondition) {
          query = query.andWhere('clothes.description ILIKE :description', {
            description: `%${description.trim()}%`,
          });
        } else {
          query = query.where('clothes.description ILIKE :description', {
            description: `%${description.trim()}%`,
          });
          hasCondition = true;
        }
      }

      if (size && size.trim() !== '') {
        if (hasCondition) {
          query = query.andWhere('CAST(size.size AS TEXT) ILIKE :size', {
            size: size.trim(),
          });
        } else {
          query = query.where('CAST(size.size AS TEXT) ILIKE :size', {
            size: size.trim(),
          });
          hasCondition = true;
        }
      }

      if (gender && gender.trim() !== '') {
        if (hasCondition) {
          query = query.andWhere('CAST(gender.gender AS TEXT) ILIKE :gender', {
            gender: gender.trim(),
          });
        } else {
          query = query.where('CAST(gender.gender AS TEXT) ILIKE :gender', {
            gender: gender.trim(),
          });
          hasCondition = true;
        }
      }

      const clothes = await query.getMany();

      return clothes;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error searching and filtering clothes');
    }
  }
}
