import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  Matches,
  Length,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaymentSettingDto {
  @IsString()
  @IsNotEmpty()
  accountHolderName: string;

  @IsString()
  @IsNotEmpty()
  bankName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message: 'Account Number must contain only numbers.' })
  accountNumber: string;

  @IsString()
  @IsNotEmpty()
  @Length(11, 11, { message: 'IFSC Code must be exactly 11 characters.' })
  ifscCode: string;

  @IsString()
  @IsNotEmpty()
  branchName: string;

  @IsString()
  @IsOptional()
  swiftCode?: string;

  @IsString()
  @IsOptional()
  accountType?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9_.-]+$/, { message: 'UPI ID must be in a valid format (e.g. name@bank).' })
  upiId?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  gpayNumber?: string;

  @IsString()
  @IsOptional()
  phonepeNumber?: string;

  @IsString()
  @IsOptional()
  paytmNumber?: string;

  @IsString()
  @IsOptional()
  qrImage?: string;

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsBoolean()
  @IsOptional()
  showBank?: boolean;

  @IsBoolean()
  @IsOptional()
  showQR?: boolean;

  @IsBoolean()
  @IsOptional()
  showUPI?: boolean;

  @IsBoolean()
  @IsOptional()
  showInstructions?: boolean;

  @IsBoolean()
  @IsOptional()
  showAccountHolder?: boolean;

  @IsBoolean()
  @IsOptional()
  showBranch?: boolean;

  @IsBoolean()
  @IsOptional()
  showIFSC?: boolean;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsString()
  @IsOptional()
  @IsIn(['Bank Transfer', 'UPI', 'Bank + UPI', 'Cash', 'Cheque'])
  activePaymentMethod?: string;
}

export class UpdatePaymentSettingDto {
  @IsString()
  @IsOptional()
  accountHolderName?: string;

  @IsString()
  @IsOptional()
  bankName?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d+$/, { message: 'Account Number must contain only numbers.' })
  accountNumber?: string;

  @IsString()
  @IsOptional()
  @Length(11, 11, { message: 'IFSC Code must be exactly 11 characters.' })
  ifscCode?: string;

  @IsString()
  @IsOptional()
  branchName?: string;

  @IsString()
  @IsOptional()
  swiftCode?: string;

  @IsString()
  @IsOptional()
  accountType?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9_.-]+$/, { message: 'UPI ID must be in a valid format (e.g. name@bank).' })
  upiId?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  gpayNumber?: string;

  @IsString()
  @IsOptional()
  phonepeNumber?: string;

  @IsString()
  @IsOptional()
  paytmNumber?: string;

  @IsString()
  @IsOptional()
  qrImage?: string;

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsBoolean()
  @IsOptional()
  showBank?: boolean;

  @IsBoolean()
  @IsOptional()
  showQR?: boolean;

  @IsBoolean()
  @IsOptional()
  showUPI?: boolean;

  @IsBoolean()
  @IsOptional()
  showInstructions?: boolean;

  @IsBoolean()
  @IsOptional()
  showAccountHolder?: boolean;

  @IsBoolean()
  @IsOptional()
  showBranch?: boolean;

  @IsBoolean()
  @IsOptional()
  showIFSC?: boolean;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsString()
  @IsOptional()
  @IsIn(['Bank Transfer', 'UPI', 'Bank + UPI', 'Cash', 'Cheque'])
  activePaymentMethod?: string;
}
