import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseIntPipe, DefaultValuePipe, UseGuards } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(@Body() dto: CreateExpenseDto) { return this.expensesService.create(dto); }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('orderId') orderId?: string,
  ) { return this.expensesService.findAll({ page, limit, search, category, orderId }); }

  @Get('summary')
  getSummary(@Query('orderId') orderId?: string) { return this.expensesService.getSummary(orderId); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.expensesService.findOne(id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateExpenseDto) { return this.expensesService.update(id, dto); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.expensesService.remove(id); }
}
