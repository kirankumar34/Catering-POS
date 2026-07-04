import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    create(dto: CreatePaymentDto): Promise<{
        order: {
            id: string;
            orderNumber: string;
            grandTotal: number;
        };
    } & {
        id: string;
        createdAt: Date;
        notes: string | null;
        orderId: string;
        amount: number;
        paymentDate: Date;
        paymentMethod: string;
        transactionId: string | null;
    }>;
    findAll(page: number, limit: number, orderId?: string, method?: string): Promise<{
        data: ({
            order: {
                customer: {
                    name: string;
                };
                id: string;
                orderNumber: string;
            };
        } & {
            id: string;
            createdAt: Date;
            notes: string | null;
            orderId: string;
            amount: number;
            paymentDate: Date;
            paymentMethod: string;
            transactionId: string | null;
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
        };
    } & {
        id: string;
        createdAt: Date;
        notes: string | null;
        orderId: string;
        amount: number;
        paymentDate: Date;
        paymentMethod: string;
        transactionId: string | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
