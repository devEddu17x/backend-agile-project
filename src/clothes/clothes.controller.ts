import { Body, Controller, Post } from '@nestjs/common';
import { ClothesService } from './clothes.service';
import { CreateClothesDTO } from './dto/clothes.dto';

@Controller('clothes')
export class ClothesController {
  constructor(private readonly clothesService: ClothesService) {}

  @Post()
  async createClothes(@Body() clothesDto: CreateClothesDTO) {
    return await this.clothesService.addNewClothesItem(clothesDto);
  }
}
