import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsDateString,
} from 'class-validator';

import { Type } from 'class-transformer';

export class CreateExpenseDto {
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number;

  @IsString()
  @IsNotEmpty()
  category: string; // GROCERIES, VEGETABLES, TRANSPORT, STAFF_SALARY, etc.

  @IsString()
  @IsOptional()
  vendor?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  orderId?: string;
}
