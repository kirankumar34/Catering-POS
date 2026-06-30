import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { BillsService } from './bills.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Get(':orderId/invoice')
  async generateInvoice(@Param('orderId') orderId: string, @Res() res: Response) {
    return this.billsService.generateInvoicePdf(orderId, res);
  }

  @Get(':orderId/quotation')
  async generateQuotation(@Param('orderId') orderId: string, @Res() res: Response) {
    return this.billsService.generateQuotationPdf(orderId, res);
  }
}
