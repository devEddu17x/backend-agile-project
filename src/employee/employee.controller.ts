import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { UpdateEmployeeDTO } from './dtos/update-employee.dto';
import {
  Session,
  SuperTokensAuthGuard,
  VerifySession,
} from 'supertokens-nestjs';
import { SessionContainer } from 'supertokens-node/recipe/session';
import { EmployeeEntity } from './entities/employee.entitiy';
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
    console.log('appUserId', appUserId);
    return await this.employeeService.updateEmployee(
      appUserId.v,
      updateEmployeeDTO,
    );
  }
}
