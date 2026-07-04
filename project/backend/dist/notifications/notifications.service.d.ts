import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    handleCronReminders(): Promise<void>;
    checkReminders(): Promise<{
        status: string;
        created: number;
    }>;
    private createNotification;
    findAll(): Promise<({
        order: {
            customer: {
                name: string;
            };
            orderNumber: string;
            eventDate: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        orderId: string;
        type: string;
        message: string;
        read: boolean;
    })[]>;
    findUnread(): Promise<({
        order: {
            customer: {
                name: string;
            };
            orderNumber: string;
            eventDate: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        orderId: string;
        type: string;
        message: string;
        read: boolean;
    })[]>;
    markAsRead(id: string): Promise<{
        id: string;
        createdAt: Date;
        orderId: string;
        type: string;
        message: string;
        read: boolean;
    }>;
    markAllAsRead(): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
