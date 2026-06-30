import { PrismaService } from '../prisma/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getSummary(): Promise<{
        kpis: {
            todayOrders: number;
            todayRevenue: number;
            pendingPayments: number;
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
            pricePerPlate: number;
            deliveryCharges: number;
            subtotal: number;
            discount: number;
            gst: number;
            additionalCost: number;
            grandTotal: number;
            advancePaid: number;
            pendingAmount: number;
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
