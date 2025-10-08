import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { ClothesEntity } from './entities/clothes.entity';
import { CreateClothesDTO } from './dto/create-clothes.dto';
import { ClothesVariantEntity } from './entities/clothes-variant.entity';
import { SizeEntity } from './entities/size.entity';
import { GenderEntity } from './entities/gender.entity';
import { CreatedClothes } from './interfaces/created-clothes.interface';
import { ClotheImageEntity } from './entities/images.entity';

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
    private readonly dataSource: DataSource,
  ) {}

  async addNewClothesItem(clothes: CreateClothesDTO): Promise<CreatedClothes> {
    const { name, description, price, variants } = clothes;

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
        .select([
          'clothes.id',
          'clothes.name',
          'clothes.description',
          'clothes.price',
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
          // Clothes fields
          'clothes.id',
          'clothes.name',
          'clothes.description',
          'clothes.price',
          'clothes.createdAt',
          'clothes.updatedAt',
          // Variant
          'variant.additional',
          'variant.id',
          // Size
          'size.size',
          // Gender
          'gender.gender',
          // Image fields
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
}
