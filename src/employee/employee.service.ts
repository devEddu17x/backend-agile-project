import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmployeeEntity } from './entities/employee.entitiy';
import { Repository } from 'typeorm/repository/Repository';
import { CreateEmployeeDTO } from './dtos/create-employee.dto';
import { UpdateEmployeeDTO } from './dtos/update-employee.dto';
import { Logger } from '@nestjs/common';
import { ROLE_NAMES } from 'src/auth/constants/roles';
import UserRoles from 'supertokens-node/recipe/userroles';

@Injectable()
export class EmployeeService {
  private readonly logger = new Logger(EmployeeService.name);
  constructor(
    @InjectRepository(EmployeeEntity)
    private readonly employeeRepository: Repository<EmployeeEntity>,
  ) {}
  async createEmployee(
    createEmployeDTO: CreateEmployeeDTO,
    superTokensId: string,
  ): Promise<EmployeeEntity> {
    try {
      const employee: EmployeeEntity = this.employeeRepository.create({
        ...createEmployeDTO,
        superTokensId,
      });
      return await this.employeeRepository.save(employee);
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException('Employee email already exists');
      }
      throw new BadRequestException('Could not create employee');
    }
  }

  async updateEmployee(
    id: string,
    updateEmployeeDTO: UpdateEmployeeDTO,
  ): Promise<EmployeeEntity> {
    if (!id)
      throw new BadRequestException(
        'Employee id is required. Verify your session',
      );
    const response = await this.employeeRepository.update(
      id,
      updateEmployeeDTO,
    );
    if (response.affected === 0) {
      throw new BadRequestException('Employee not found');
    }
    return await this.employeeRepository.findOneBy({ id });
  }

  async deleteEmployee(id: string): Promise<void> {
    try {
      const result = await this.employeeRepository.delete(id);
      if (result.affected === 0) {
        throw new BadRequestException('Employee not found');
      }
    } catch (error) {
      this.logger.error('Error deleting employee or does not exist');
      throw new BadRequestException(
        'Error deleting employee or does not exist',
      );
    }
  }

  async deleteEmployeeBySuperTokensId(
    superTokensId: string,
  ): Promise<{ message: string }> {
    try {
      const result = await this.employeeRepository.delete({ superTokensId });
      if (result.affected !== 0) {
        return { message: 'Employee deleted successfully' };
      }
    } catch (error) {
      throw new BadRequestException(
        'Error deleting employee or does not exist',
      );
    }
  }

  async updateEmployeeRole(
    appUserId: string,
    role: ROLE_NAMES,
  ): Promise<{ message: string }> {
    const response = await UserRoles.addRoleToUser('public', appUserId, role);
    if (response.status !== 'OK') {
      throw new BadRequestException('Could not update user role');
    }
    return { message: `Role ${role} assigned to user ${appUserId}` };
  }

  async revokeEmployeeRole(appUserId: string, role: ROLE_NAMES) {
    const response = await UserRoles.removeUserRole('public', appUserId, role);
    if (response.status !== 'OK') {
      throw new BadRequestException('Could not revoke user role');
    }
    return { message: `Role ${role} revoked from user ${appUserId}` };
  }

  async getAllEmployees(): Promise<EmployeeEntity[]> {
    const employees = await this.employeeRepository.find();
    if (!employees || employees.length === 0) {
      throw new NotFoundException('No employees found');
    }
    return employees;
  }
}
