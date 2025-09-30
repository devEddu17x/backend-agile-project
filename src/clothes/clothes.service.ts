import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClothesEntity } from './entities/clothes.entity';
import { CreateClothesDTO } from './dto/clothes.dto';
import { ClothesVariantEntity } from './entities/clothes-variant.entity';
import { SizeEntity } from './entities/size.entity';
import { GenderEntity } from './entities/gender.entity';

@Injectable()
export class ClothesService {
  constructor(
    @InjectRepository(ClothesEntity)
    private readonly clothesRepository: Repository<ClothesEntity>,
    @InjectRepository(ClothesEntity)
    private readonly variantsRepository: Repository<ClothesVariantEntity>,
    @InjectRepository(SizeEntity)
    private readonly sizeEntity: Repository<SizeEntity>,
    @InjectRepository(GenderEntity)
    private readonly genderEntity: Repository<GenderEntity>,
  ) {}

  async addNewClothesItem(clothes: CreateClothesDTO) {
    const { name, description, price, variants } = clothes;

    const newClothe = this.clothesRepository.create({
      name,
      description,
      price,
    });
    const newVariants = variants.map((variant) =>
      this.variantsRepository.create({
        clothesId: newClothe.id,
        sizeId: variant.size,
        genderId: variant.gender,
      }),
    );

    try {
      await this.clothesRepository.save(newClothe);
      await this.variantsRepository.save(newVariants);
    } catch (error) {
      throw new BadRequestException('Error creating the clothes item');
    }
  }
}
