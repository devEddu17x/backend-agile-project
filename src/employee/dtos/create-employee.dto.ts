import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateEmployeeDTO {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(50)
  email: string;
}
