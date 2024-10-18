import { user_role } from '@prisma/client';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  password: string;

  @IsBoolean()
  @IsOptional()
  enabled: boolean;

  @IsString()
  @IsIn(['ADMIN', 'USER'])
  role: user_role;

  @IsString()
  @IsOptional()
  managerId?: string;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  jobTitleId?: string;

  @IsDate()
  @IsOptional()
  dateOfJoining?: Date;

  @IsDate()
  @IsOptional()
  lastAccessDate?: Date;
}
