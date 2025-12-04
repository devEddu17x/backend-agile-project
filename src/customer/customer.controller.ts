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

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  // === ENDPOINTS PÚBLICOS (E-COMMERCE) ===

  /**
   * Registro de usuario e-commerce
   * POST /api/v1/customers/register
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async registerEcommerceUser(@Body() registerDTO: RegisterEcommerceUserDTO) {
    const result =
      await this.customerService.registerEcommerceUser(registerDTO);

    return {
      message: 'Usuario registrado exitosamente',
      customer: {
        id: result.customer.id,
        names: result.customer.names,
        lastNames: result.customer.lastNames,
        email: result.customer.email,
      },
      // El frontend usará estos datos para iniciar sesión automáticamente
      auth: {
        email: result.customer.email,
        // No devolvemos el password, el frontend debe llamar a /auth/signin
      },
    };
  }

  // === ENDPOINTS PROTEGIDOS (EMPLEADOS) ===

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
