import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsDateString,
  IsIn,
} from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsDateString()
  @IsOptional()
  paymentDate?: string;

  @IsString()
  @IsOptional()
  @IsIn(['UPI', 'CASH', 'BANK', 'CARD'])
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  transactionId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
