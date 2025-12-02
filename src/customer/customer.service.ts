import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCustomerDTO } from './dtos/create-customer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerEntity } from './entities/customer.entity';
import { Repository } from 'typeorm';
import { UpdateCustomerDTO } from './dtos/update-customer.dto';

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

  async getCustomerById(id: string): Promise<CustomerEntity> {
    let customer: CustomerEntity;
    try {
      customer = await this.customerRepository.findOne({ where: { id } });
    } catch (error) {
      throw new BadRequestException('Error retrieving customer');
    }
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async updateCustomer(id: string, customerDTO: UpdateCustomerDTO) {
    const result = await this.customerRepository.update(id, customerDTO);
    if (result.affected === 0) {
      throw new NotFoundException('Customer not found');
    }
    return this.getCustomerById(id);
  }

  async searchCustomers(
    names?: string,
    lastNames?: string,
    phone?: string,
  ): Promise<CustomerEntity[]> {
    if (!names && !lastNames && !phone) {
      return [];
    }

    try {
      let query = this.customerRepository.createQueryBuilder('customer');
      let hasCondition = false;

      if (names && names.trim() !== '') {
        query = query.where('customer.names ILIKE :names', {
          names: `%${names.trim()}%`,
        });
        hasCondition = true;
      }

      if (lastNames && lastNames.trim() !== '') {
        if (hasCondition) {
          query = query.andWhere('customer.lastNames ILIKE :lastNames', {
            lastNames: `%${lastNames.trim()}%`,
          });
        } else {
          query = query.where('customer.lastNames ILIKE :lastNames', {
            lastNames: `%${lastNames.trim()}%`,
          });
          hasCondition = true;
        }
      }

      if (phone && phone.trim() !== '') {
        if (hasCondition) {
          query = query.andWhere('customer.phone ILIKE :phone', {
            phone: `%${phone.trim()}%`,
          });
        } else {
          query = query.where('customer.phone ILIKE :phone', {
            phone: `%${phone.trim()}%`,
          });
        }
      }

      const customers = await query.getMany();
      return customers;
    } catch (error) {
      throw new BadRequestException('Error searching customers');
    }
  }
}
