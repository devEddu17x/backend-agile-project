import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
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

  @Get(':id')
  async getQuoteById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<QuoteEntity> {
    return this.quoteService.getQuoteById(id);
  }

  @Get()
  async getAllQuotes(): Promise<QuoteSummary[]> {
    return this.quoteService.getAll();
  }

  @Get()
  async getQuotesByStatus(
    @Query('status', new ParseEnumPipe(QuoteStatus)) status: QuoteStatus,
  ): Promise<QuoteSummary[]> {
    return this.quoteService.getQuotesByStatus(status);
  }

  @Put()
  async updateQuote(@Body() dto: UpdateQuoteDTO): Promise<CreatedClothes> {
    return this.quoteService.updateQuote(dto);
  }
}
