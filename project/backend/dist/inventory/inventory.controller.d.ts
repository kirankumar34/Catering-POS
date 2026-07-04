import { InventoryService, UpdateInventoryDto } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    create(dto: CreateInventoryDto): Promise<{
        id: string;
        updatedAt: Date;
        itemName: string;
        currentStock: number;
        unit: string;
        lowStockThreshold: number;
        purchaseCost: number;
        supplier: string | null;
    }>;
    findAll(page: number, limit: number, search?: string, lowStock?: boolean): Promise<{
        data: {
            isLowStock: boolean;
            id: string;
            updatedAt: Date;
            itemName: string;
            currentStock: number;
            unit: string;
            lowStockThreshold: number;
            purchaseCost: number;
            supplier: string | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        lowStockCount: number;
    }>;
    findOne(id: string): Promise<{
        isLowStock: boolean;
        id: string;
        updatedAt: Date;
        itemName: string;
        currentStock: number;
        unit: string;
        lowStockThreshold: number;
        purchaseCost: number;
        supplier: string | null;
    }>;
    update(id: string, dto: UpdateInventoryDto): Promise<{
        id: string;
        updatedAt: Date;
        itemName: string;
        currentStock: number;
        unit: string;
        lowStockThreshold: number;
        purchaseCost: number;
        supplier: string | null;
    }>;
    adjustStock(id: string, delta: number): Promise<{
        id: string;
        updatedAt: Date;
        itemName: string;
        currentStock: number;
        unit: string;
        lowStockThreshold: number;
        purchaseCost: number;
        supplier: string | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
