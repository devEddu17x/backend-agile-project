import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeEntity } from './entities/employee.entitiy';

@Module({
  imports: [TypeOrmModule.forFeature([EmployeeEntity])],
})
export class EmployeeModule {}
