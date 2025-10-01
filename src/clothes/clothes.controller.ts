import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ClothesService } from './clothes.service';
import { CreateClothesDTO } from './dto/create-clothes.dto';
import { SuperTokensAuthGuard } from 'supertokens-nestjs';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ROLES } from 'src/auth/constants/roles';

@Roles(ROLES.ADMIN)
@UseGuards(SuperTokensAuthGuard, RolesGuard)
@Controller('clothes')
export class ClothesController {
  constructor(private readonly clothesService: ClothesService) {}
  @Post()
  async createClothes(@Body() clothesDto: CreateClothesDTO) {
    return await this.clothesService.addNewClothesItem(clothesDto);
  }
}
