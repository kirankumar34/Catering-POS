import { PrismaService } from '../prisma/prisma.service';
export declare class ProfitService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    calculateForOrder(orderId: string): Promise<{
        id: string;
        updatedAt: Date;
        orderId: string;
        netProfit: number;
        revenue: number;
        totalExpense: number;
        profitPercent: number;
    }>;
    getForOrder(orderId: string): Promise<{
        id: string;
        updatedAt: Date;
        orderId: string;
        netProfit: number;
        revenue: number;
        totalExpense: number;
        profitPercent: number;
    }>;
    getOverallSummary(): Promise<{
        totalRevenue: number;
        totalExpenses: number;
        netProfit: number;
        profitPercent: number;
    }>;
}
