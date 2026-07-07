import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsBoolean,
  Min,
} from 'class-validator';

export class UpdateMenuDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  pricePerPlate?: number;

  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  itemIds?: string[];
}
