import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsDateString,
} from 'class-validator';

export class UpdateExpenseDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  category?: string;

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
