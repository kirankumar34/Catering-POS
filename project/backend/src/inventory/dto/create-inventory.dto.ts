import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';

import { Type } from 'class-transformer';

export class CreateInventoryDto {
  @IsString()
  @IsNotEmpty()
  itemName: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  currentStock?: number;

  @IsString()
  @IsNotEmpty()
  unit: string; // KG, LITER, PACKET, PCS

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  lowStockThreshold?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  purchaseCost?: number;

  @IsString()
  @IsOptional()
  supplier?: string;
}
