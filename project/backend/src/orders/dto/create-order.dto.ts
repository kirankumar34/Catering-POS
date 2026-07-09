import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsDateString,
  IsArray,
  ValidateNested,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsString()
  @IsNotEmpty()
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

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsString()
  @IsOptional()
  menuId?: string;

  @IsDateString()
  eventDate: string;

  @IsString()
  @IsOptional()
  eventType?: string;

  @IsString()
  @IsOptional()
  venue?: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  numberOfPlates: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  pricePerPlate: number;

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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  @IsOptional()
  items?: CreateOrderItemDto[];
}
