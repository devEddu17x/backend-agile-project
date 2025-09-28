import { Body, Controller, Param, Patch } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { UpdateEmployeeDTO } from './dtos/update-employee.dto';
import { EmployeeEntity } from './entities/employee.entitiy';

@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Patch(':id')
  async updateEmployee(
    @Param('id') id: string,
    @Body() updateEmployeeDTO: UpdateEmployeeDTO,
  ): Promise<EmployeeEntity> {
    return await this.employeeService.updateEmployee(id, updateEmployeeDTO);
  }
}
