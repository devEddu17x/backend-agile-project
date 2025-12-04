import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerEntity } from './entities/customer.entity';
import { CustomerEcommerceService } from './services/customer-ecommerce.service';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerEntity])],
  providers: [CustomerService, CustomerEcommerceService],
  controllers: [CustomerController],
  exports: [CustomerService],
})
export class CustomerModule {}
