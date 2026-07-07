import {
  IsString,
  IsOptional,
  IsEmail,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCustomerAddressDto } from './create-customer.dto';

export class UpdateCustomerAddressDto extends CreateCustomerAddressDto {
  @IsString()
  @IsOptional()
  id?: string;
}

export class UpdateCustomerDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  altPhone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  gstNumber?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateCustomerAddressDto)
  addresses?: UpdateCustomerAddressDto[];
}
