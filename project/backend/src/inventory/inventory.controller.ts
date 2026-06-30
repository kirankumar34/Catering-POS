import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseIntPipe, DefaultValuePipe, ParseBoolPipe, UseGuards } from '@nestjs/common';
import { InventoryService, UpdateInventoryDto } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  create(@Body() dto: CreateInventoryDto) { return this.inventoryService.create(dto); }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(15), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('lowStock', new DefaultValuePipe(false), ParseBoolPipe) lowStock?: boolean,
  ) { return this.inventoryService.findAll({ page, limit, search, lowStock }); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.inventoryService.findOne(id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInventoryDto) { return this.inventoryService.update(id, dto); }

  @Patch(':id/adjust')
  adjustStock(@Param('id') id: string, @Body('delta') delta: number) { return this.inventoryService.adjustStock(id, delta); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.inventoryService.remove(id); }
}
