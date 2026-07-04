import { ProfitService } from './profit.service';
export declare class ProfitController {
    private readonly profitService;
    constructor(profitService: ProfitService);
    getOverallSummary(): Promise<{
        totalRevenue: number;
        totalExpenses: number;
        netProfit: number;
        profitPercent: number;
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
    calculate(orderId: string): Promise<{
        id: string;
        updatedAt: Date;
        orderId: string;
        netProfit: import("@prisma/client/runtime/library").Decimal;
        revenue: import("@prisma/client/runtime/library").Decimal;
        totalExpense: import("@prisma/client/runtime/library").Decimal;
        profitPercent: import("@prisma/client/runtime/library").Decimal;
    }>;
}
