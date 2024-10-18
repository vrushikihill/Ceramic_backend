import { IsNumber, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @IsNumber()
  @IsPositive()
  page: number;

  @IsNumber()
  @IsPositive()
  @Min(1)
  pageSize: number;
}
