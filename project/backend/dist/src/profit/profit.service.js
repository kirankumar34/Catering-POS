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
exports.ProfitService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProfitService = class ProfitService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async calculateForOrder(orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { expenses: true },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const revenue = order.grandTotal;
        const totalExpense = order.expenses.reduce((sum, e) => sum + e.amount, 0);
        const netProfit = revenue - totalExpense;
        const profitPercent = revenue > 0 ? (netProfit / revenue) * 100 : 0;
        const analysis = await this.prisma.profitAnalysis.upsert({
            where: { orderId },
            create: { orderId, revenue, totalExpense, netProfit, profitPercent },
            update: { revenue, totalExpense, netProfit, profitPercent },
        });
        return analysis;
    }
    async getForOrder(orderId) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
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
        const totalRevenue = orders._sum.grandTotal || 0;
        const totalExpenses = expenses._sum.amount || 0;
        const netProfit = totalRevenue - totalExpenses;
        const profitPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
        return { totalRevenue, totalExpenses, netProfit, profitPercent };
    }
};
exports.ProfitService = ProfitService;
exports.ProfitService = ProfitService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProfitService);
//# sourceMappingURL=profit.service.js.map