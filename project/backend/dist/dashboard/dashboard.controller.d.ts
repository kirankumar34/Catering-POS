import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getSummary(): Promise<{
        kpis: {
            todayOrders: number;
            todayRevenue: number | import("@prisma/client/runtime/library").Decimal;
            pendingPayments: number | import("@prisma/client/runtime/library").Decimal;
            completedOrders: number;
            monthlyRevenue: number;
            monthlyExpenses: number;
            monthlyProfit: number;
        };
        upcomingEvents: ({
            customer: {
                name: string;
                phone: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            orderNumber: string;
            customerId: string;
            menuId: string | null;
            eventDate: Date;
            eventType: string | null;
            venue: string | null;
            numberOfPlates: number;
            pricePerPlate: import("@prisma/client/runtime/library").Decimal;
            deliveryCharges: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            discount: import("@prisma/client/runtime/library").Decimal;
            gst: import("@prisma/client/runtime/library").Decimal;
            additionalCost: import("@prisma/client/runtime/library").Decimal;
            grandTotal: import("@prisma/client/runtime/library").Decimal;
            advancePaid: import("@prisma/client/runtime/library").Decimal;
            pendingAmount: import("@prisma/client/runtime/library").Decimal;
            status: string;
        })[];
    }>;
    getChartsData(): Promise<any[]>;
    getRecentActivity(): Promise<({
        user: {
            role: {
                name: string;
            };
            username: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        action: string;
        details: string | null;
    })[]>;
    getTopCustomers(): Promise<any[]>;
}
