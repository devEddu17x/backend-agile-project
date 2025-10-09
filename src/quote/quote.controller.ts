import {
  Body,
  Controller,
  Get,
  ParseEnumPipe,
  Post,
  Query,
} from '@nestjs/common';
import { QuoteService } from './quote.service';
import { CreateQuoteDTO } from './dtos/create-quote.dto';
import { QuoteStatus } from './enums/status.enum';

@Controller('quote')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Post()
  async createQuote(@Body() dto: CreateQuoteDTO): Promise<any> {
    return this.quoteService.createQuote(dto);
  }

  @Get()
  async getQuotesByStatus(
    @Query('status', new ParseEnumPipe(QuoteStatus)) status: QuoteStatus,
  ) {
    return this.quoteService.getQuotesByStatus(status);
  }
}
