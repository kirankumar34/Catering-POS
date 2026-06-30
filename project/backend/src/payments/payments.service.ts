import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePaymentDto) {
    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const payment = await this.prisma.payment.create({
      data: {
        orderId: dto.orderId,
        amount: dto.amount,
        paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
        paymentMethod: dto.paymentMethod || 'CASH',
        transactionId: dto.transactionId ?? null,
        notes: dto.notes ?? null,
      },
      include: { order: { select: { id: true, orderNumber: true, grandTotal: true } } },
    });

    // Recalculate pendingAmount on the order
    const allPayments = await this.prisma.payment.findMany({ where: { orderId: dto.orderId } });
    const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);
    await this.prisma.order.update({
      where: { id: dto.orderId },
      data: {
        advancePaid: totalPaid,
        pendingAmount: Math.max(order.grandTotal - totalPaid, 0),
      },
    });

    return payment;
  }

  async findAll(query: { page?: number; limit?: number; orderId?: string; method?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 12;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (query.orderId) where.orderId = query.orderId;
    if (query.method) where.paymentMethod = query.method;

    const [total, data] = await this.prisma.$transaction([
      this.prisma.payment.count({ where }),
      this.prisma.payment.findMany({
        where, skip, take: limit,
        orderBy: { paymentDate: 'desc' },
        include: {
          order: { select: { id: true, orderNumber: true, customer: { select: { name: true } } } },
        },
      }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const p = await this.prisma.payment.findUnique({
      where: { id },
      include: { order: { select: { id: true, orderNumber: true } } },
    });
    if (!p) throw new NotFoundException(`Payment #${id} not found`);
    return p;
  }

  async remove(id: string) {
    const payment = await this.findOne(id);
    await this.prisma.payment.delete({ where: { id } });

    // Recalculate order pending amount after removal
    const order = await this.prisma.order.findUnique({ where: { id: payment.orderId } });
    if (order) {
      const remaining = await this.prisma.payment.findMany({ where: { orderId: payment.orderId } });
      const totalPaid = remaining.reduce((sum, p) => sum + p.amount, 0);
      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: { advancePaid: totalPaid, pendingAmount: Math.max(order.grandTotal - totalPaid, 0) },
      });
    }
    return { message: 'Payment deleted successfully' };
  }
}
