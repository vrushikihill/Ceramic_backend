import { user_role } from '@prisma/client';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsBoolean()
  @IsNotEmpty()
  enabled: boolean;

  @IsString()
  @IsIn(['ADMIN', 'USER'])
  role: user_role;
}
