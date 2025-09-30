import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { ROLE_NAMES } from 'src/auth/constants/roles';

export class PromoteEmployeeDTO {
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @IsEnum(ROLE_NAMES)
  role: ROLE_NAMES;
}
