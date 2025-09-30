import { EmployeeEntity } from '../entities/employee.entitiy';

export interface EmployeeWithRoles extends EmployeeEntity {
  roles: string[];
}
