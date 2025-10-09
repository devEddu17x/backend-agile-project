import {
  Body,
  Controller,
  Get,
  ParseEnumPipe,
  Post,
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

@Roles(ROLES.SELLER)
@UseGuards(SuperTokensAuthGuard, RolesGuard)
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
