import { EmployeeEntity } from '../entities/employee.entity';

export interface EmployeeWithRoles extends EmployeeEntity {
  roles: string[];
}
