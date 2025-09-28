import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCustomerDTO } from './dtos/customer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerEntity } from './entities/customer.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
  ) {}
  async createCustomer(customerDTO: CreateCustomerDTO) {
    const newCustomer = this.customerRepository.create(customerDTO);
    const createdUser = await this.customerRepository.save(newCustomer);
    if (!createdUser) {
      throw new BadRequestException(
        'Error creating user or user already exists',
      );
    }

    return createdUser;
  }
}
