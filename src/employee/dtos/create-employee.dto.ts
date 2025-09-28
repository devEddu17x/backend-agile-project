import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateEmployeeDTO {
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
  @MaxLength(50)
  reference: string;
}
