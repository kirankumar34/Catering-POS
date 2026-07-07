import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChecklistService {
  constructor(private readonly prisma: PrismaService) {}

  async getChecklistForOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');

    return this.prisma.orderChecklistItem.findMany({
      where: { orderId },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async addChecklistItem(orderId: string, label: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');

    const maxItem = await this.prisma.orderChecklistItem.findFirst({
      where: { orderId },
      orderBy: { orderIndex: 'desc' },
    });
    const nextIndex = maxItem ? maxItem.orderIndex + 1 : 0;

    return this.prisma.orderChecklistItem.create({
      data: {
        orderId,
        label,
        orderIndex: nextIndex,
      },
    });
  }

  async updateChecklistItem(id: string, checked: boolean) {
    const item = await this.prisma.orderChecklistItem.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException('Checklist item not found');

    return this.prisma.orderChecklistItem.update({
      where: { id },
      data: {
        checked,
        checkedAt: checked ? new Date() : null,
      },
    });
  }

  async deleteChecklistItem(id: string) {
    const item = await this.prisma.orderChecklistItem.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException('Checklist item not found');

    await this.prisma.orderChecklistItem.delete({ where: { id } });
    return { success: true };
  }

  async loadFromTemplate(orderId: string, templateId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');

    const template = await this.prisma.checklistTemplate.findUnique({
      where: { id: templateId },
      include: { items: true },
    });
    if (!template) throw new NotFoundException('Template not found');

    // Get current checklist items for this order to prevent duplicate labels
    const currentItems = await this.prisma.orderChecklistItem.findMany({
      where: { orderId },
    });
    const currentLabels = new Set(
      currentItems.map((i) => i.label.toLowerCase()),
    );

    // Get max index
    const maxItem = await this.prisma.orderChecklistItem.findFirst({
      where: { orderId },
      orderBy: { orderIndex: 'desc' },
    });
    let nextIndex = maxItem ? maxItem.orderIndex + 1 : 0;

    const itemsToCreate: {
      orderId: string;
      label: string;
      orderIndex: number;
      checked: boolean;
    }[] = [];
    for (const tItem of template.items) {
      if (!currentLabels.has(tItem.label.toLowerCase())) {
        itemsToCreate.push({
          orderId,
          label: tItem.label,
          orderIndex: nextIndex++,
          checked: false,
        });
      }
    }

    if (itemsToCreate.length > 0) {
      await this.prisma.orderChecklistItem.createMany({
        data: itemsToCreate,
      });
    }

    return this.getChecklistForOrder(orderId);
  }

  async getTemplates() {
    return this.prisma.checklistTemplate.findMany({
      include: { items: { orderBy: { orderIndex: 'asc' } } },
    });
  }
}
