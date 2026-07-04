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
        netProfit: number;
        revenue: number;
        totalExpense: number;
        profitPercent: number;
    }>;
    calculate(orderId: string): Promise<{
        id: string;
        updatedAt: Date;
        orderId: string;
        netProfit: number;
        revenue: number;
        totalExpense: number;
        profitPercent: number;
    }>;
}
