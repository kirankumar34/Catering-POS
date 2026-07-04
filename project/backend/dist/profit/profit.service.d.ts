import { PrismaService } from '../prisma/prisma.service';
export declare class ProfitService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    calculateForOrder(orderId: string): Promise<{
        id: string;
        updatedAt: Date;
        orderId: string;
        netProfit: import("@prisma/client/runtime/library").Decimal;
        revenue: import("@prisma/client/runtime/library").Decimal;
        totalExpense: import("@prisma/client/runtime/library").Decimal;
        profitPercent: import("@prisma/client/runtime/library").Decimal;
    }>;
    getForOrder(orderId: string): Promise<{
        id: string;
        updatedAt: Date;
        orderId: string;
        netProfit: import("@prisma/client/runtime/library").Decimal;
        revenue: import("@prisma/client/runtime/library").Decimal;
        totalExpense: import("@prisma/client/runtime/library").Decimal;
        profitPercent: import("@prisma/client/runtime/library").Decimal;
    }>;
    getOverallSummary(): Promise<{
        totalRevenue: number;
        totalExpenses: number;
        netProfit: number;
        profitPercent: number;
    }>;
}
