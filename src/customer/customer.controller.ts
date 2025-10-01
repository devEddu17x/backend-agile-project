import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDTO } from './dtos/customer.dto';
import { SuperTokensAuthGuard } from 'supertokens-nestjs';
import { ROLES } from 'src/auth/constants/roles';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Roles(ROLES.SELLER)
@UseGuards(SuperTokensAuthGuard, RolesGuard)
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}
  @Post()
  async createCustomer(@Body() customerDTO: CreateCustomerDTO) {
    return await this.customerService.createCustomer(customerDTO);
  }
}
