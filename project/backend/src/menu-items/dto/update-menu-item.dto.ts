import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
} from 'class-validator';

export class UpdateMenuItemDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsBoolean()
  @IsOptional()
  isVeg?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  available?: boolean;
}
