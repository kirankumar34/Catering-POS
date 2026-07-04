"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PaymentsService = class PaymentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
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
        const allPayments = await this.prisma.payment.findMany({ where: { orderId: dto.orderId } });
        const totalPaid = allPayments.reduce((sum, p) => sum + Number(p.amount), 0);
        await this.prisma.order.update({
            where: { id: dto.orderId },
            data: {
                advancePaid: totalPaid,
                pendingAmount: Math.max(Number(order.grandTotal) - totalPaid, 0),
            },
        });
        return payment;
    }
    async findAll(query) {
        const page = query.page || 1;
        const limit = query.limit || 12;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.orderId)
            where.orderId = query.orderId;
        if (query.method)
            where.paymentMethod = query.method;
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
    async findOne(id) {
        const p = await this.prisma.payment.findUnique({
            where: { id },
            include: { order: { select: { id: true, orderNumber: true } } },
        });
        if (!p)
            throw new common_1.NotFoundException(`Payment #${id} not found`);
        return p;
    }
    async remove(id) {
        const payment = await this.findOne(id);
        await this.prisma.payment.delete({ where: { id } });
        const order = await this.prisma.order.findUnique({ where: { id: payment.orderId } });
        if (order) {
            const remaining = await this.prisma.payment.findMany({ where: { orderId: payment.orderId } });
            const totalPaid = remaining.reduce((sum, p) => sum + Number(p.amount), 0);
            await this.prisma.order.update({
                where: { id: payment.orderId },
                data: { advancePaid: totalPaid, pendingAmount: Math.max(Number(order.grandTotal) - totalPaid, 0) },
            });
        }
        return { message: 'Payment deleted successfully' };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map