import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDTO } from './dtos/customer.dto';
import { SuperTokensAuthGuard, VerifySession } from 'supertokens-nestjs';
import { ROLES } from 'src/auth/constants/roles';

@UseGuards(SuperTokensAuthGuard)
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @VerifySession({
    roles: [ROLES.ADMIN, ROLES.SELLER],
  })
  @Post()
  async createCustomer(@Body() customerDTO: CreateCustomerDTO) {
    return await this.customerService.createCustomer(customerDTO);
  }
}
