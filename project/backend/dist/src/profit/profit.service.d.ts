import { PrismaService } from '../prisma/prisma.service';
export declare class ProfitService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    calculateForOrder(orderId: string): Promise<{
        id: string;
        updatedAt: Date;
        netProfit: number;
        revenue: number;
        totalExpense: number;
        profitPercent: number;
        orderId: string;
    }>;
    getForOrder(orderId: string): Promise<{
        id: string;
        updatedAt: Date;
        netProfit: number;
        revenue: number;
        totalExpense: number;
        profitPercent: number;
        orderId: string;
    }>;
    getOverallSummary(): Promise<{
        totalRevenue: number;
        totalExpenses: number;
        netProfit: number;
        profitPercent: number;
    }>;
}
