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
        netProfit: number;
        revenue: number;
        totalExpense: number;
        profitPercent: number;
        orderId: string;
    }>;
    calculate(orderId: string): Promise<{
        id: string;
        updatedAt: Date;
        netProfit: number;
        revenue: number;
        totalExpense: number;
        profitPercent: number;
        orderId: string;
    }>;
}
