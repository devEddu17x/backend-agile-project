import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { EmployeeRoleUpdateDTO } from './dtos/promote-employee.dto';
import { SuperTokensAuthGuard } from 'supertokens-nestjs';
import { ROLES } from 'src/auth/constants/roles';
import { CreateEmployeeDTO } from 'src/employee/dtos/create-employee.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Roles(ROLES.ADMIN)
@UseGuards(SuperTokensAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  @Get('roles')
  async getAllRoles() {
    return await this.adminService.getAllRoles();
  }

  @Patch('employees/promote')
  async promoteEmployeeRole(@Body() roleUpdate: EmployeeRoleUpdateDTO) {
    return await this.adminService.updateEmployeeRole(
      roleUpdate.email,
      roleUpdate.role,
    );
  }

  @Patch('employees/revoke')
  async revokeEmployeeRole(@Body() roleUpdate: EmployeeRoleUpdateDTO) {
    return await this.adminService.revokeEmployeeRole(
      roleUpdate.email,
      roleUpdate.role,
    );
  }

  @Post('employees')
  async createEmployee(@Body() createEmployeeDTO: CreateEmployeeDTO) {
    return await this.adminService.createEmployee(createEmployeeDTO);
  }

  @Get('employees')
  async getAllEmployees() {
    return await this.adminService.getAllEmployees();
  }

  @Delete('employees/:superTokenId')
  async deleteEmployee(@Param('superTokenId') id: string) {
    return await this.adminService.deleteEmployee(id);
  }
}
