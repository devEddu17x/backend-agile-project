import {
  Body,
  Controller,
  Get,
  Patch,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { UpdateEmployeeDTO } from './dtos/update-employee.dto';
import {
  Session,
  SuperTokensAuthGuard,
  VerifySession,
} from 'supertokens-nestjs';
import { SessionContainer } from 'supertokens-node/recipe/session';
import { EmployeeEntity } from './entities/employee.entity';
@UseGuards(SuperTokensAuthGuard)
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get('me')
  @VerifySession()
  async getEmployee(
    @Session() session: SessionContainer,
  ): Promise<EmployeeEntity & { roles: string[] }> {
    const appUserId = session.getAccessTokenPayload().appUserId;
    if (!appUserId) {
      throw new UnauthorizedException('Session missing app user id');
    }
    const [employee, userRoles] = await Promise.all([
      this.employeeService.getEmployee(appUserId.v),
      this.employeeService.getRolesForEmployee(session.getUserId()),
    ]);
    return { ...employee, roles: userRoles };
  }

  @Patch()
  @VerifySession()
  async updateEmployee(
    @Body() updateEmployeeDTO: UpdateEmployeeDTO,
    @Session() session: SessionContainer,
  ): Promise<EmployeeEntity> {
    const appUserId = session.getAccessTokenPayload().appUserId;
    if (!appUserId) {
      throw new UnauthorizedException('Session missing app user id');
    }
    return await this.employeeService.updateEmployee(
      appUserId.v,
      updateEmployeeDTO,
    );
  }
}
