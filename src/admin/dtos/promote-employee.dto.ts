import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { ROLES } from 'src/auth/constants/roles';

export class EmployeeRoleUpdateDTO {
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @IsEnum(ROLES)
  role: ROLES;
}
