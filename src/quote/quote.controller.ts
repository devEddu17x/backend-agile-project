import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QuoteService } from './quote.service';
import { CreateQuoteDTO } from './dtos/create-quote.dto';
import { QuoteStatus } from './enums/status.enum';
import { SuperTokensAuthGuard } from 'supertokens-nestjs';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ROLES } from 'src/auth/constants/roles';
import { QuoteSummary } from './interfaces/clothes-data.interface';
import { CreatedClothes } from './interfaces/created-clothes.interface';
import { UpdateQuoteDTO } from './dtos/update-quote.dto';
import { QuoteEntity } from './entities/quote.entity';

@Roles(ROLES.SELLER)
@UseGuards(SuperTokensAuthGuard, RolesGuard)
@Controller('quotes')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Post()
  async createQuote(@Body() dto: CreateQuoteDTO): Promise<CreatedClothes> {
    return this.quoteService.createQuote(dto);
  }

  @Get()
  async getQuotes(
    @Query('status') status?: QuoteStatus,
  ): Promise<QuoteSummary[]> {
    if (!status) {
      return this.quoteService.getAll();
    }
    // Validar que sea un valor válido del enum
    if (!Object.values(QuoteStatus).includes(status)) {
      throw new BadRequestException(
        `Invalid status. Valid values: ${Object.values(QuoteStatus).join(', ')}`,
      );
    }
    return this.quoteService.getQuotesByStatus(status);
  }

  @Get(':id')
  async getQuoteById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<QuoteEntity> {
    return this.quoteService.getQuoteById(id);
  }

  @Put(':id')
  async updateQuote(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuoteDTO,
  ): Promise<CreatedClothes> {
    return this.quoteService.updateQuote(id, dto);
  }
}
