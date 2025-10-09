import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async getAllCustomers(): Promise<CustomerEntity[]> {
    let customers: CustomerEntity[];
    try {
      customers = await this.customerRepository.find();
    } catch (error) {
      throw new BadRequestException('Error retrieving customers');
    }
    if (!customers || customers.length === 0) {
      throw new NotFoundException('No customers found');
    }
    return customers;
  }
}
