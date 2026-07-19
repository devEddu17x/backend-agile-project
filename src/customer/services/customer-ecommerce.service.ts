import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import EmailPassword from 'supertokens-node/recipe/emailpassword';
import UserRoles from 'supertokens-node/recipe/userroles';
import { ROLES } from 'src/auth/constants/roles';
import SuperTokens from 'supertokens-node';
import { RegisterEcommerceUserDTO } from '../dtos/register-ecommerce-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerEntity } from '../entities/customer.entity';

@Injectable()
export class CustomerEcommerceService {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
  ) {}

  async registerEcommerceUser(
    registerDTO: RegisterEcommerceUserDTO,
  ): Promise<CustomerEntity> {
    const { names, lastNames, email, password } = registerDTO;

    const existingCustomer = await this.customerRepository.findOne({
      where: { email },
    });

    if (existingCustomer) {
      throw new ConflictException(
        'Email is already registered. Please sign in.',
      );
    }

    let superTokensResponse;
    try {
      superTokensResponse = await EmailPassword.signUp(
        'public',
        email,
        password,
      );
    } catch (error) {
      throw new BadRequestException(
        'Error creating account. Please try again.',
      );
    }

    if (superTokensResponse.status !== 'OK') {
      if (superTokensResponse.status === 'EMAIL_ALREADY_EXISTS_ERROR') {
        throw new ConflictException(
          'Email is already registered in system. Please sign in.',
        );
      }
      throw new BadRequestException('Error creating account');
    }

    const superTokensUserId = superTokensResponse.user.id;

    let customer: CustomerEntity;
    try {
      const newCustomer = this.customerRepository.create({
        names,
        lastNames,
        email,
        superTokensId: superTokensUserId,
        isEcommerceUser: true,
        phone: null,
        reference: 'E-commerce Registration',
      });

      customer = await this.customerRepository.save(newCustomer);
    } catch (error) {
      await SuperTokens.deleteUser(superTokensUserId);
      throw new BadRequestException(
        'Error creating user profile. Please try again.',
      );
    }

    try {
      await UserRoles.addRoleToUser(
        'public',
        superTokensUserId,
        ROLES.CUSTOMER,
      );
    } catch (error) {
      await this.customerRepository.delete(customer.id);
      await SuperTokens.deleteUser(superTokensUserId);
      throw new BadRequestException('Error assigning user permissions');
    }

    return customer;
  }

  async getCustomerBySuperTokensId(
    superTokensId: string,
  ): Promise<CustomerEntity> {
    const customer = await this.customerRepository.findOne({
      where: { superTokensId },
    });

    if (!customer) {
      throw new NotFoundException(
        'User profile not found for the given SuperTokens ID',
      );
    }

    return customer;
  }

  async getCustomerByEmail(email: string): Promise<CustomerEntity | null> {
    return this.customerRepository.findOne({
      where: { email },
    });
  }

  async isEmailRegistered(email: string): Promise<boolean> {
    const exists = await this.customerRepository.existsBy({ email });
    return exists;
  }
}
