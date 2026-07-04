import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
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
    markAllAsRead(): Promise<import("@prisma/client").Prisma.BatchPayload>;
    markAsRead(id: string): Promise<{
        id: string;
        createdAt: Date;
        orderId: string;
        type: string;
        message: string;
        read: boolean;
    }>;
    triggerCheck(): Promise<{
        status: string;
        created: number;
    }>;
}
