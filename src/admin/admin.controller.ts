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
import { PromoteEmployeeDTO } from './dtos/promote-employee.dto';
import { SuperTokensAuthGuard, VerifySession } from 'supertokens-nestjs';
import { ROLE_NAMES } from 'src/auth/constants/roles';
import { CreateEmployeeDTO } from 'src/employee/dtos/create-employee.dto';

@UseGuards(SuperTokensAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  @VerifySession({
    roles: [ROLE_NAMES.ADMIN],
  })
  @Get('roles')
  async getAllRoles() {
    return await this.adminService.getAllRoles();
  }
  @VerifySession({
    roles: [ROLE_NAMES.ADMIN],
  })
  @Patch('employees/promote')
  async promoteEmployeeRole(@Body() promoteEmployeeDTO: PromoteEmployeeDTO) {
    return await this.adminService.updateEmployeeRole(
      promoteEmployeeDTO.email,
      promoteEmployeeDTO.role,
    );
  }

  @VerifySession({
    roles: [ROLE_NAMES.ADMIN],
  })
  @Patch('employees/revoke')
  async revokeEmployeeRole(@Body() promoteEmployeeDTO: PromoteEmployeeDTO) {
    return await this.adminService.revokeEmployeeRole(
      promoteEmployeeDTO.email,
      promoteEmployeeDTO.role,
    );
  }

  @VerifySession({
    roles: [ROLE_NAMES.ADMIN],
  })
  @Post('employees')
  async createEmployee(@Body() createEmployeeDTO: CreateEmployeeDTO) {
    return await this.adminService.createEmployee(createEmployeeDTO);
  }

  @VerifySession({
    roles: [ROLE_NAMES.ADMIN],
  })
  @Get('employees')
  async getAllEmployees() {
    return await this.adminService.getAllEmployees();
  }

  @VerifySession({
    roles: [ROLE_NAMES.ADMIN],
  })
  @Delete('employees/:superTokenId')
  async deleteEmployee(@Param('superTokenId') id: string) {
    return await this.adminService.deleteEmployee(id);
  }
}
