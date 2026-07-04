import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
export declare class OrdersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private generateOrderNumber;
    private calculateTotals;
    create(dto: CreateOrderDto): Promise<{
        customer: {
            id: string;
            name: string;
            phone: string;
        };
        menu: {
            id: string;
            name: string;
        } | null;
        items: ({
            item: {
                id: string;
                name: string;
                category: string;
            };
        } & {
            id: string;
            orderId: string;
            itemId: string;
            quantity: number;
            rate: import("@prisma/client/runtime/library").Decimal;
        })[];
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
    }>;
    findAll(query: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
    }): Promise<{
        data: ({
            customer: {
                id: string;
                name: string;
                phone: string;
            };
            menu: {
                id: string;
                name: string;
            } | null;
            _count: {
                payments: number;
                items: number;
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
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        customer: {
            addresses: {
                id: string;
                address: string;
                location: string | null;
                isDefault: boolean;
                customerId: string;
            }[];
        } & {
            email: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string;
            altPhone: string | null;
            gstNumber: string | null;
            notes: string | null;
        };
        menu: ({
            items: {
                id: string;
                name: string;
                category: string;
                isVeg: boolean;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            pricePerPlate: import("@prisma/client/runtime/library").Decimal;
            status: boolean;
        }) | null;
        profitAnalysis: {
            id: string;
            updatedAt: Date;
            orderId: string;
            netProfit: import("@prisma/client/runtime/library").Decimal;
            revenue: import("@prisma/client/runtime/library").Decimal;
            totalExpense: import("@prisma/client/runtime/library").Decimal;
            profitPercent: import("@prisma/client/runtime/library").Decimal;
        } | null;
        bills: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            grandTotal: import("@prisma/client/runtime/library").Decimal;
            pendingAmount: import("@prisma/client/runtime/library").Decimal;
            invoiceNumber: string;
            orderId: string;
            billDate: Date;
            amountPaid: import("@prisma/client/runtime/library").Decimal;
            pdfUrl: string | null;
        }[];
        payments: {
            id: string;
            createdAt: Date;
            notes: string | null;
            orderId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            paymentDate: Date;
            paymentMethod: string;
            transactionId: string | null;
        }[];
        items: ({
            item: {
                id: string;
                name: string;
                category: string;
                isVeg: boolean;
            };
        } & {
            id: string;
            orderId: string;
            itemId: string;
            quantity: number;
            rate: import("@prisma/client/runtime/library").Decimal;
        })[];
        expenses: {
            id: string;
            createdAt: Date;
            notes: string | null;
            orderId: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            category: string;
            date: Date;
            vendor: string | null;
        }[];
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
    }>;
    update(id: string, dto: UpdateOrderDto): Promise<{
        customer: {
            id: string;
            name: string;
            phone: string;
        };
        menu: {
            id: string;
            name: string;
        } | null;
        items: ({
            item: {
                id: string;
                name: string;
                category: string;
            };
        } & {
            id: string;
            orderId: string;
            itemId: string;
            quantity: number;
            rate: import("@prisma/client/runtime/library").Decimal;
        })[];
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
    }>;
    updateStatus(id: string, status: string): Promise<{
        customer: {
            id: string;
            name: string;
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
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
