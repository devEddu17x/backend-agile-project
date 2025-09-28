import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmployeeEntity } from './entities/employee.entitiy';
import { Repository } from 'typeorm/repository/Repository';
import { CreateEmployeeDTO } from './dtos/create-employee.dto';
import { UpdateEmployeeDTO } from './dtos/update-employee.dto';

@Injectable()
export class EmployeeService {
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
      console.log(error);
      throw new BadRequestException('Could not create employee');
    }
  }

  async updateEmployee(
    id: string,
    updateEmployeeDTO: UpdateEmployeeDTO,
  ): Promise<EmployeeEntity> {
    try {
      await this.employeeRepository.update(id, updateEmployeeDTO);
      return await this.employeeRepository.findOneBy({ id });
    } catch (error) {
      throw new BadRequestException('Could not update employee');
    }
  }
}
