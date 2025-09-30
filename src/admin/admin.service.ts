import { Injectable, NotFoundException } from '@nestjs/common';
import { ROLE_NAMES } from 'src/auth/constants/roles';
import { EmployeeService } from 'src/employee/employee.service';
import UserRoles from 'supertokens-node/recipe/userroles';
import SuperTokens, { User } from 'supertokens-node';
import { CreateEmployeeDTO } from 'src/employee/dtos/create-employee.dto';
import { EmployeeEntity } from 'src/employee/entities/employee.entitiy';
import EmailPassword from 'supertokens-node/recipe/emailpassword';

@Injectable()
export class AdminService {
  constructor(private readonly employeeService: EmployeeService) {}
  async getAllRoles() {
    const roles: string[] = (await UserRoles.getAllRoles()).roles;

    if (!roles || roles.length === 0) {
      throw new NotFoundException('No roles found');
    }
    return roles;
  }

  async createEmployee(
    createEmployeeDTO: CreateEmployeeDTO,
  ): Promise<EmployeeEntity | { status: string }> {
    const stRes = await EmailPassword.signUp(
      'public',
      createEmployeeDTO.email,
      createEmployeeDTO.password,
    );

    if (stRes.status !== 'OK') {
      return stRes;
    }

    let employee = null;
    employee = await this.employeeService.createEmployee(
      createEmployeeDTO,
      stRes.user.id,
    );

    if (!employee) {
      await SuperTokens.deleteUser(stRes.user.id);
      throw new NotFoundException('Could not create employee');
    }
    return employee;
  }

  async updateEmployeeRole(email: string, role: ROLE_NAMES) {
    const userResponse: User[] = await SuperTokens.listUsersByAccountInfo(
      'public',
      {
        email,
      },
    );

    if (userResponse.length === 0) {
      throw new NotFoundException('User not found');
    }
    const appUserId = userResponse[0].id;
    return await this.employeeService.updateEmployeeRole(appUserId, role);
  }

  async getAllEmployees() {
    return await this.employeeService.getAllEmployees();
  }
}
