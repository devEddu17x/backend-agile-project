import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateEmployeeDTO {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  names?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastNames?: string;
}
