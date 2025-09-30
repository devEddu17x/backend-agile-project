import { Injectable, NotFoundException } from '@nestjs/common';
import { ROLE_NAMES } from 'src/auth/constants/roles';
import { EmployeeService } from 'src/employee/employee.service';
import UserRoles from 'supertokens-node/recipe/userroles';
import SuperTokens, { User } from 'supertokens-node';

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
