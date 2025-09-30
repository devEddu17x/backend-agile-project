import {
  Body,
  Controller,
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
@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

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
