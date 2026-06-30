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
        id: string;
        name: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
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
            id: string;
            name: string;
            email: string | null;
            createdAt: Date;
            updatedAt: Date;
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
                grandTotal: number;
                pendingAmount: number;
                orderId: string;
                invoiceNumber: string;
                billDate: Date;
                amountPaid: number;
                pdfUrl: string | null;
            }[];
            payments: {
                id: string;
                createdAt: Date;
                notes: string | null;
                amount: number;
                paymentDate: Date;
                orderId: string;
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
        id: string;
        name: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
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
        id: string;
        name: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        altPhone: string | null;
        gstNumber: string | null;
        notes: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        altPhone: string | null;
        gstNumber: string | null;
        notes: string | null;
    }>;
}
