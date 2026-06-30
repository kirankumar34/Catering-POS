import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ProfitService } from './profit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('profit')
export class ProfitController {
  constructor(private readonly profitService: ProfitService) {}

  @Get('summary')
  getOverallSummary() { return this.profitService.getOverallSummary(); }

  @Get('order/:orderId')
  getForOrder(@Param('orderId') orderId: string) { return this.profitService.getForOrder(orderId); }

  @Post('order/:orderId/calculate')
  calculate(@Param('orderId') orderId: string) { return this.profitService.calculateForOrder(orderId); }
}
