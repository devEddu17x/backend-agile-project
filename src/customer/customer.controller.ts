import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDTO } from './dtos/create-customer.dto';
import { SuperTokensAuthGuard } from 'supertokens-nestjs';
import { ROLES } from 'src/auth/constants/roles';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CustomerEntity } from './entities/customer.entity';
import { UpdateCustomerDTO } from './dtos/update-customer.dto';

@Roles(ROLES.SELLER)
@UseGuards(SuperTokensAuthGuard, RolesGuard)
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}
  @Post()
  async createCustomer(@Body() customerDTO: CreateCustomerDTO) {
    return await this.customerService.createCustomer(customerDTO);
  }

  @Get()
  async getAllCustomers(): Promise<CustomerEntity[]> {
    return await this.customerService.getAllCustomers();
  }

  @Get('search')
  async searchCustomers(
    @Query('names') names?: string,
    @Query('lastnames') lastNames?: string,
    @Query('phone') phone?: string,
  ): Promise<CustomerEntity[]> {
    return await this.customerService.searchCustomers(names, lastNames, phone);
  }

  @Patch(':id')
  async updateCustomer(
    @Body() customerDTO: UpdateCustomerDTO,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return await this.customerService.updateCustomer(id, customerDTO);
  }
}
