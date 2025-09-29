import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmployeeEntity } from './entities/employee.entitiy';
import { Repository } from 'typeorm/repository/Repository';
import { CreateEmployeeDTO } from './dtos/create-employee.dto';
import { UpdateEmployeeDTO } from './dtos/update-employee.dto';
import { Logger } from '@nestjs/common';

@Injectable()
export class EmployeeService {
  private readonly logger = new Logger(EmployeeService.name);
  constructor(
    @InjectRepository(EmployeeEntity)
    private readonly employeeRepository: Repository<EmployeeEntity>,
  ) {}
  async createEmployee(
    createEmployeDTO: CreateEmployeeDTO,
  ): Promise<EmployeeEntity> {
    try {
      const employee: EmployeeEntity = this.employeeRepository.create({
        ...createEmployeDTO,
        names: '',
        lastNames: '',
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
      await this.employeeRepository.delete(id);
    } catch (error) {
      this.logger.error('Error deleting employee or does not exist');
    }
  }
}
