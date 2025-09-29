import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClothesEntity } from './entities/clothes.entity';
import { CreateClothesDTO } from './dto/clothes.dto';

@Injectable()
export class ClothesService {
  constructor(
    @InjectRepository(ClothesEntity)
    private readonly clothesRepository: Repository<ClothesEntity>,
  ) {}

  async create(clothes: CreateClothesDTO) {
    const newClothes = this.clothesRepository.create(clothes);
    const createdClothes = await this.clothesRepository.save(newClothes);
    if (!createdClothes) {
      throw new BadRequestException('Error creating the clothes item');
    }
    return createdClothes;
  }
}
