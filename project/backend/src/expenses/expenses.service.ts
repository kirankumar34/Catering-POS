import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

export const EXPENSE_CATEGORIES = [
  'GROCERIES', 'VEGETABLES', 'RICE', 'OIL', 'MASALA', 'MILK', 'GAS',
  'TRANSPORT', 'STAFF_SALARY', 'COOKING_CHARGES', 'SERVING_STAFF',
  'CLEANING', 'PAPER_PLATES', 'BANANA_LEAF', 'WATER_BOTTLE',
  'DECORATION', 'RENTAL', 'GENERATOR', 'ADMIN', 'MISC',
];

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateExpenseDto) {
    if (dto.orderId) {
      const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
      if (!order) throw new NotFoundException('Order not found');
    }
    return this.prisma.expense.create({
      data: {
        amount: dto.amount,
        category: dto.category,
        vendor: dto.vendor ?? null,
        date: dto.date ? new Date(dto.date) : new Date(),
        notes: dto.notes ?? null,
        orderId: dto.orderId ?? null,
      },
      include: { order: { select: { id: true, orderNumber: true } } },
    });
  }

  async findAll(query: { page?: number; limit?: number; search?: string; category?: string; orderId?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 12;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (query.category) where.category = query.category;
    if (query.orderId) where.orderId = query.orderId;
    if (query.search) {
      where.OR = [
        { vendor: { contains: query.search } },
        { notes: { contains: query.search } },
        { category: { contains: query.search } },
      ];
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.expense.count({ where }),
      this.prisma.expense.findMany({
        where, skip, take: limit,
        orderBy: { date: 'desc' },
        include: { order: { select: { id: true, orderNumber: true } } },
      }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: { order: { select: { id: true, orderNumber: true } } },
    });
    if (!expense) throw new NotFoundException(`Expense #${id} not found`);
    return expense;
  }

  async update(id: string, dto: UpdateExpenseDto) {
    await this.findOne(id);
    return this.prisma.expense.update({
      where: { id },
      data: {
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.category && { category: dto.category }),
        ...(dto.vendor !== undefined && { vendor: dto.vendor }),
        ...(dto.date && { date: new Date(dto.date) }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.orderId !== undefined && { orderId: dto.orderId || null }),
      },
      include: { order: { select: { id: true, orderNumber: true } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.expense.delete({ where: { id } });
    return { message: 'Expense deleted successfully' };
  }

  async getSummary(orderId?: string) {
    const where = orderId ? { orderId } : {};
    const expenses = await this.prisma.expense.findMany({ where });
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const byCategory: Record<string, number> = {};
    expenses.forEach(e => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });
    return { total, count: expenses.length, byCategory };
  }
}
