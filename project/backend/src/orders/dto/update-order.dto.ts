import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsDateString,
  IsArray,
  ValidateNested,
  IsInt,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

class UpdateOrderItemDto {
  @IsString()
  itemId: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  rate: number;
}

export class UpdateOrderDto {
  @IsString()
  @IsOptional()
  customerId?: string;

  @IsString()
  @IsOptional()
  menuId?: string | null;

  @IsDateString()
  @IsOptional()
  eventDate?: string;

  @IsString()
  @IsOptional()
  eventType?: string;

  @IsString()
  @IsOptional()
  venue?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  numberOfPlates?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  pricePerPlate?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  discount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  gst?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  additionalCost?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  deliveryCharges?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  advancePaid?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  @IsIn(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'])
  status?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemDto)
  @IsOptional()
  items?: UpdateOrderItemDto[];
}
