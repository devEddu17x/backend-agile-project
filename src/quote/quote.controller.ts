import { Body, Controller, Post } from '@nestjs/common';
import { QuoteService } from './quote.service';
import { CreateQuoteDTO } from './dtos/create-quote.dto';

@Controller('quote')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Post()
  async createQuote(@Body() dto: CreateQuoteDTO): Promise<any> {
    return this.quoteService.createQuote(dto);
  }
}
