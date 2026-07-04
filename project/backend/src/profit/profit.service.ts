import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfitService {
  constructor(private readonly prisma: PrismaService) {}

  async calculateForOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { expenses: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    const revenue = Number(order.grandTotal);
    const totalExpense = order.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const netProfit = revenue - totalExpense;
    const profitPercent = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    // Upsert ProfitAnalysis record
    const analysis = await this.prisma.profitAnalysis.upsert({
      where: { orderId },
      create: { orderId, revenue, totalExpense, netProfit, profitPercent },
      update: { revenue, totalExpense, netProfit, profitPercent },
    });

    return analysis;
  }

  async getForOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const analysis = await this.prisma.profitAnalysis.findUnique({ where: { orderId } });
    if (!analysis) {
      return this.calculateForOrder(orderId);
    }
    return analysis;
  }

  async getOverallSummary() {
    const [orders, expenses, analyses] = await this.prisma.$transaction([
      this.prisma.order.aggregate({ _sum: { grandTotal: true }, where: { status: { not: 'CANCELLED' } } }),
      this.prisma.expense.aggregate({ _sum: { amount: true } }),
      this.prisma.profitAnalysis.aggregate({ _sum: { netProfit: true, totalExpense: true } }),
    ]);

    const totalRevenue = Number(orders._sum.grandTotal || 0);
    const totalExpenses = Number(expenses._sum.amount || 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return { totalRevenue, totalExpenses, netProfit, profitPercent };
  }
}
