import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
export declare class ExpensesController {
    private readonly expensesService;
    constructor(expensesService: ExpensesService);
    create(dto: CreateExpenseDto): Promise<{
        order: {
            id: string;
            orderNumber: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        notes: string | null;
        orderId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        category: string;
        date: Date;
        vendor: string | null;
    }>;
    findAll(page: number, limit: number, search?: string, category?: string, orderId?: string): Promise<{
        data: ({
            order: {
                id: string;
                orderNumber: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            notes: string | null;
            orderId: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            category: string;
            date: Date;
            vendor: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getSummary(orderId?: string): Promise<{
        total: number;
        count: number;
        byCategory: Record<string, number>;
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
        orderId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        category: string;
        date: Date;
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
        orderId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        category: string;
        date: Date;
        vendor: string | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
