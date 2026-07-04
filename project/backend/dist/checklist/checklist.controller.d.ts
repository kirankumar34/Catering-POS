import { ChecklistService } from './checklist.service';
export declare class ChecklistController {
    private readonly checklistService;
    constructor(checklistService: ChecklistService);
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
    updateChecklistItem(itemId: string, checked: boolean): Promise<{
        id: string;
        orderId: string;
        label: string;
        checked: boolean;
        checkedAt: Date | null;
        orderIndex: number;
    }>;
    deleteChecklistItem(itemId: string): Promise<{
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
}
