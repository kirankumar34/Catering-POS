import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
export declare const EXPENSE_CATEGORIES: string[];
export declare class ExpensesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateExpenseDto): Promise<{
        order: {
            id: string;
            orderNumber: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        notes: string | null;
        amount: number;
        category: string;
        date: Date;
        orderId: string | null;
        vendor: string | null;
    }>;
    findAll(query: {
        page?: number;
        limit?: number;
        search?: string;
        category?: string;
        orderId?: string;
    }): Promise<{
        data: ({
            order: {
                id: string;
                orderNumber: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            notes: string | null;
            amount: number;
            category: string;
            date: Date;
            orderId: string | null;
            vendor: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        order: {
            id: string;
            orderNumber: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        notes: string | null;
        amount: number;
        category: string;
        date: Date;
        orderId: string | null;
        vendor: string | null;
    }>;
    update(id: string, dto: UpdateExpenseDto): Promise<{
        order: {
            id: string;
            orderNumber: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        notes: string | null;
        amount: number;
        category: string;
        date: Date;
        orderId: string | null;
        vendor: string | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getSummary(orderId?: string): Promise<{
        total: number;
        count: number;
        byCategory: Record<string, number>;
    }>;
}
