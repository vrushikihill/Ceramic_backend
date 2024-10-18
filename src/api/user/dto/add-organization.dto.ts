import { IsNotEmpty, IsString } from 'class-validator';

export class AddOrganizationDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
