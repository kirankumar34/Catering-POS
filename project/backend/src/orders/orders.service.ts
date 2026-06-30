import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Utility: generate sequential order number ──────────────────────────
  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `ORD-${year}-`;
    const lastOrder = await this.prisma.order.findFirst({
      where: { orderNumber: { startsWith: prefix } },
      orderBy: { createdAt: 'desc' },
    });

    let sequence = 1;
    if (lastOrder) {
      const lastSeq = parseInt(lastOrder.orderNumber.split('-')[2], 10);
      sequence = lastSeq + 1;
    }
    return `${prefix}${String(sequence).padStart(4, '0')}`;
  }

  // ─── Utility: calculate billing totals ──────────────────────────────────
  private calculateTotals(
    numberOfPlates: number,
    pricePerPlate: number,
    discount = 0,
    gst = 0,
    additionalCost = 0,
    deliveryCharges = 0,
    advancePaid = 0,
  ) {
    const subtotal = numberOfPlates * pricePerPlate;
    const discountAmount = (subtotal * discount) / 100;
    const afterDiscount = subtotal - discountAmount;
    const gstAmount = (afterDiscount * gst) / 100;
    const grandTotal = afterDiscount + gstAmount + additionalCost + deliveryCharges;
    const pendingAmount = grandTotal - advancePaid;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      grandTotal: Math.round(grandTotal * 100) / 100,
      pendingAmount: Math.round(pendingAmount * 100) / 100,
    };
  }

  // ─── CREATE ─────────────────────────────────────────────────────────────
  async create(dto: CreateOrderDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    if (dto.menuId) {
      const menu = await this.prisma.menu.findUnique({
        where: { id: dto.menuId },
      });
      if (!menu) throw new NotFoundException('Menu package not found');
    }

    const orderNumber = await this.generateOrderNumber();

    const { subtotal, grandTotal, pendingAmount } = this.calculateTotals(
      dto.numberOfPlates,
      dto.pricePerPlate,
      dto.discount,
      dto.gst,
      dto.additionalCost,
      dto.deliveryCharges,
      dto.advancePaid,
    );

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        customerId: dto.customerId,
        menuId: dto.menuId ?? null,
        eventDate: new Date(dto.eventDate),
        eventType: dto.eventType ?? null,
        venue: dto.venue ?? null,
        numberOfPlates: dto.numberOfPlates,
        pricePerPlate: dto.pricePerPlate,
        subtotal,
        discount: dto.discount ?? 0,
        gst: dto.gst ?? 0,
        additionalCost: dto.additionalCost ?? 0,
        deliveryCharges: dto.deliveryCharges ?? 0,
        grandTotal,
        advancePaid: dto.advancePaid ?? 0,
        pendingAmount,
        notes: dto.notes ?? null,
        items:
          dto.items && dto.items.length > 0
            ? {
                create: dto.items.map((item) => ({
                  itemId: item.itemId,
                  quantity: item.quantity,
                  rate: item.rate,
                })),
              }
            : undefined,
      },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        menu: { select: { id: true, name: true } },
        items: { include: { item: { select: { id: true, name: true, category: true } } } },
      },
    });

    return order;
  }

  // ─── LIST ────────────────────────────────────────────────────────────────
  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.search) {
      where.OR = [
        { orderNumber: { contains: query.search } },
        { customer: { name: { contains: query.search } } },
        { customer: { phone: { contains: query.search } } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          menu: { select: { id: true, name: true } },
          _count: { select: { items: true, payments: true } },
        },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── GET ONE ─────────────────────────────────────────────────────────────
  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          include: { addresses: true },
        },
        menu: {
          include: {
            items: { select: { id: true, name: true, category: true, isVeg: true } },
          },
        },
        items: {
          include: {
            item: { select: { id: true, name: true, category: true, isVeg: true } },
          },
        },
        bills: true,
        payments: { orderBy: { paymentDate: 'desc' } },
        expenses: { orderBy: { date: 'desc' } },
        profitAnalysis: true,
      },
    });

    if (!order) throw new NotFoundException(`Order #${id} not found`);
    return order;
  }

  // ─── UPDATE ──────────────────────────────────────────────────────────────
  async update(id: string, dto: UpdateOrderDto) {
    const existing = await this.prisma.order.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Order #${id} not found`);

    if (existing.status === 'CANCELLED') {
      throw new BadRequestException('Cannot edit a cancelled order');
    }

    const numberOfPlates = dto.numberOfPlates ?? existing.numberOfPlates;
    const pricePerPlate = dto.pricePerPlate ?? existing.pricePerPlate;
    const discount = dto.discount ?? existing.discount;
    const gst = dto.gst ?? existing.gst;
    const additionalCost = dto.additionalCost ?? existing.additionalCost;
    const deliveryCharges = dto.deliveryCharges ?? existing.deliveryCharges;
    const advancePaid = dto.advancePaid ?? existing.advancePaid;

    const { subtotal, grandTotal, pendingAmount } = this.calculateTotals(
      numberOfPlates,
      pricePerPlate,
      discount,
      gst,
      additionalCost,
      deliveryCharges,
      advancePaid,
    );

    // Handle items update: delete old + insert new
    if (dto.items !== undefined) {
      await this.prisma.orderItem.deleteMany({ where: { orderId: id } });
    }

    const order = await this.prisma.order.update({
      where: { id },
      data: {
        ...(dto.customerId && { customerId: dto.customerId }),
        ...(dto.menuId !== undefined && { menuId: dto.menuId || null }),
        ...(dto.eventDate && { eventDate: new Date(dto.eventDate) }),
        ...(dto.eventType !== undefined && { eventType: dto.eventType }),
        ...(dto.venue !== undefined && { venue: dto.venue }),
        numberOfPlates,
        pricePerPlate,
        subtotal,
        discount,
        gst,
        additionalCost,
        deliveryCharges,
        grandTotal,
        advancePaid,
        pendingAmount,
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.status && { status: dto.status }),
        ...(dto.items && dto.items.length > 0 && {
          items: {
            create: dto.items.map((item) => ({
              itemId: item.itemId,
              quantity: item.quantity,
              rate: item.rate,
            })),
          },
        }),
      },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        menu: { select: { id: true, name: true } },
        items: { include: { item: { select: { id: true, name: true, category: true } } } },
      },
    });

    return order;
  }

  // ─── STATUS UPDATE ───────────────────────────────────────────────────────
  async updateStatus(id: string, status: string) {
    const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }

    const existing = await this.prisma.order.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Order #${id} not found`);

    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        customer: { select: { id: true, name: true } },
      },
    });
  }

  // ─── DELETE ──────────────────────────────────────────────────────────────
  async remove(id: string) {
    const existing = await this.prisma.order.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Order #${id} not found`);

    // Only allow deletion of PENDING or CANCELLED orders
    if (!['PENDING', 'CANCELLED'].includes(existing.status)) {
      throw new BadRequestException(
        'Only PENDING or CANCELLED orders can be deleted',
      );
    }

    // Cascade delete items first (onDelete: Cascade handles it via Prisma)
    await this.prisma.order.delete({ where: { id } });
    return { message: `Order ${existing.orderNumber} deleted successfully` };
  }
}
