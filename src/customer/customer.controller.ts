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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDTO } from './dtos/create-customer.dto';
import { SuperTokensAuthGuard } from 'supertokens-nestjs';
import { ROLES } from 'src/auth/constants/roles';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CustomerEntity } from './entities/customer.entity';
import { UpdateCustomerDTO } from './dtos/update-customer.dto';
import { RegisterEcommerceUserDTO } from './dtos/register-ecommerce-user.dto';
import { CustomerEcommerceService } from './services/customer-ecommerce.service';

@Controller('customers')
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly customerEcommerceService: CustomerEcommerceService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async registerEcommerceUser(@Body() registerDTO: RegisterEcommerceUserDTO) {
    const customer =
      await this.customerEcommerceService.registerEcommerceUser(registerDTO);

    return {
      message: 'Usuario registrado exitosamente',
      customer: {
        id: customer.id,
        names: customer.names,
        lastNames: customer.lastNames,
        email: customer.email,
      },
    };
  }

  @Roles(ROLES.SELLER)
  @UseGuards(SuperTokensAuthGuard, RolesGuard)
  @Post()
  async createCustomer(@Body() customerDTO: CreateCustomerDTO) {
    return await this.customerService.createCustomer(customerDTO);
  }

  @Roles(ROLES.SELLER)
  @UseGuards(SuperTokensAuthGuard, RolesGuard)
  @Get()
  async getAllCustomers(): Promise<CustomerEntity[]> {
    return await this.customerService.getAllCustomers();
  }

  @Roles(ROLES.SELLER)
  @UseGuards(SuperTokensAuthGuard, RolesGuard)
  @Get('search')
  async searchCustomers(
    @Query('names') names?: string,
    @Query('lastnames') lastNames?: string,
    @Query('phone') phone?: string,
  ): Promise<CustomerEntity[]> {
    return await this.customerService.searchCustomers(names, lastNames, phone);
  }

  @Roles(ROLES.SELLER)
  @UseGuards(SuperTokensAuthGuard, RolesGuard)
  @Patch(':id')
  async updateCustomer(
    @Body() customerDTO: UpdateCustomerDTO,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return await this.customerService.updateCustomer(id, customerDTO);
  }
}
