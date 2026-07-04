import { PrismaService } from '../prisma/prisma.service';
export declare class ChecklistService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getChecklistForOrder(orderId: string): Promise<{
        id: string;
        orderId: string;
        label: string;
        checked: boolean;
        checkedAt: Date | null;
        orderIndex: number;
    }[]>;
    addChecklistItem(orderId: string, label: string): Promise<{
        id: string;
        orderId: string;
        label: string;
        checked: boolean;
        checkedAt: Date | null;
        orderIndex: number;
    }>;
    updateChecklistItem(id: string, checked: boolean): Promise<{
        id: string;
        orderId: string;
        label: string;
        checked: boolean;
        checkedAt: Date | null;
        orderIndex: number;
    }>;
    deleteChecklistItem(id: string): Promise<{
        success: boolean;
    }>;
    loadFromTemplate(orderId: string, templateId: string): Promise<{
        id: string;
        orderId: string;
        label: string;
        checked: boolean;
        checkedAt: Date | null;
        orderIndex: number;
    }[]>;
    getTemplates(): Promise<({
        items: {
            id: string;
            label: string;
            orderIndex: number;
            templateId: string;
        }[];
    } & {
        id: string;
        name: string;
    })[]>;
}
