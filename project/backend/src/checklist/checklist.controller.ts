import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ChecklistService } from './checklist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller()
export class ChecklistController {
  constructor(private readonly checklistService: ChecklistService) {}

  @Get('checklist-templates')
  async getTemplates() {
    return this.checklistService.getTemplates();
  }

  @Get('orders/:orderId/checklist')
  async getChecklistForOrder(@Param('orderId') orderId: string) {
    return this.checklistService.getChecklistForOrder(orderId);
  }

  @Post('orders/:orderId/checklist')
  async addChecklistItem(
    @Param('orderId') orderId: string,
    @Body('label') label: string,
  ) {
    return this.checklistService.addChecklistItem(orderId, label);
  }

  @Patch('orders/:orderId/checklist/:itemId')
  async updateChecklistItem(
    @Param('itemId') itemId: string,
    @Body('checked') checked: boolean,
  ) {
    return this.checklistService.updateChecklistItem(itemId, checked);
  }

  @Delete('orders/:orderId/checklist/:itemId')
  async deleteChecklistItem(@Param('itemId') itemId: string) {
    return this.checklistService.deleteChecklistItem(itemId);
  }

  @Post('orders/:orderId/checklist/from-template/:templateId')
  async loadFromTemplate(
    @Param('orderId') orderId: string,
    @Param('templateId') templateId: string,
  ) {
    return this.checklistService.loadFromTemplate(orderId, templateId);
  }
}
