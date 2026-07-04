import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
export declare class CustomersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createCustomerDto: CreateCustomerDto): Promise<{
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
    }>;
    findAll(query: {
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: ({
            _count: {
                orders: number;
            };
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
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        stats: {
            totalOrders: number;
            totalSpending: number;
            pendingBalance: number;
        };
        addresses: {
            id: string;
            address: string;
            location: string | null;
            isDefault: boolean;
            customerId: string;
        }[];
        orders: ({
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
        email: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        phone: string;
        altPhone: string | null;
        gstNumber: string | null;
        notes: string | null;
    }>;
    update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<{
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
    }>;
    remove(id: string): Promise<{
        email: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        phone: string;
        altPhone: string | null;
        gstNumber: string | null;
        notes: string | null;
    }>;
}
