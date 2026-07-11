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
exports.ExpensesService = exports.EXPENSE_CATEGORIES = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
exports.EXPENSE_CATEGORIES = [
    'GROCERIES',
    'VEGETABLES',
    'RICE',
    'OIL',
    'MASALA',
    'MILK',
    'GAS',
    'TRANSPORT',
    'STAFF_SALARY',
    'COOKING_CHARGES',
    'SERVING_STAFF',
    'CLEANING',
    'PAPER_PLATES',
    'BANANA_LEAF',
    'WATER_BOTTLE',
    'DECORATION',
    'RENTAL',
    'GENERATOR',
    'ADMIN',
    'MISC',
];
let ExpensesService = class ExpensesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        if (dto.orderId) {
            const order = await this.prisma.order.findUnique({
                where: { id: dto.orderId },
            });
            if (!order)
                throw new common_1.NotFoundException('Order not found');
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
    async findAll(query) {
        const page = query.page || 1;
        const limit = query.limit || 12;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.category)
            where.category = query.category;
        if (query.orderId)
            where.orderId = query.orderId;
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
                where,
                skip,
                take: limit,
                orderBy: { date: 'desc' },
                include: { order: { select: { id: true, orderNumber: true } } },
            }),
        ]);
        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async findOne(id) {
        const expense = await this.prisma.expense.findUnique({
            where: { id },
            include: { order: { select: { id: true, orderNumber: true } } },
        });
        if (!expense)
            throw new common_1.NotFoundException(`Expense #${id} not found`);
        return expense;
    }
    async update(id, dto) {
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
    async remove(id) {
        await this.findOne(id);
        await this.prisma.expense.delete({ where: { id } });
        return { message: 'Expense deleted successfully' };
    }
    async getSummary(orderId) {
        const where = orderId ? { orderId } : {};
        const expenses = await this.prisma.expense.findMany({ where });
        const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
        const byCategory = {};
        expenses.forEach((e) => {
            byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount);
        });
        return { total, count: expenses.length, byCategory };
    }
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map