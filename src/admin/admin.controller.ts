import {
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { PromoteEmployeeDTO } from './dtos/promote-employee.dto';
import { SuperTokensAuthGuard, VerifySession } from 'supertokens-nestjs';
import { ROLE_NAMES } from 'src/auth/constants/roles';

@UseGuards(SuperTokensAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  @VerifySession({
    roles: [ROLE_NAMES.ADMIN],
  })
  @Get('roles')
  async getAllRoles() {
    try {
      return await this.adminService.getAllRoles();
    } catch (error) {
      throw new NotFoundException('Could not fetch roles');
    }
  }
  @VerifySession({
    roles: [ROLE_NAMES.ADMIN],
  })
  @Patch('employees/promote')
  async promoteEmployeeRole(@Body() promoteEmployeeDTO: PromoteEmployeeDTO) {
    try {
      return await this.adminService.updateEmployeeRole(
        promoteEmployeeDTO.email,
        promoteEmployeeDTO.role,
      );
    } catch (error) {
      throw new ConflictException('Could not update employee role');
    }
  }
  @VerifySession({
    roles: [ROLE_NAMES.ADMIN],
  })
  @Get('employees')
  async getAllEmployees() {
    return await this.adminService.getAllEmployees();
  }
}
