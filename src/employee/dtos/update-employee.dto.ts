import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateEmployeeDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  names: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastNames: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(50)
  email: string;
}
