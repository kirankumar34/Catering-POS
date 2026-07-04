import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
export declare class MenuItemsController {
    private readonly menuItemsService;
    constructor(menuItemsService: MenuItemsService);
    create(createMenuItemDto: CreateMenuItemDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        category: string;
        isVeg: boolean;
        price: import("@prisma/client/runtime/library").Decimal;
        available: boolean;
    }>;
    findAll(search?: string, category?: string, page?: string, limit?: string): Promise<{
        data: {
            id: string;
            name: string;
            description: string | null;
            category: string;
            isVeg: boolean;
            price: import("@prisma/client/runtime/library").Decimal;
            available: boolean;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        menus: {
            id: string;
            name: string;
        }[];
    } & {
        id: string;
        name: string;
        description: string | null;
        category: string;
        isVeg: boolean;
        price: import("@prisma/client/runtime/library").Decimal;
        available: boolean;
    }>;
    update(id: string, updateMenuItemDto: UpdateMenuItemDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        category: string;
        isVeg: boolean;
        price: import("@prisma/client/runtime/library").Decimal;
        available: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        category: string;
        isVeg: boolean;
        price: import("@prisma/client/runtime/library").Decimal;
        available: boolean;
    }>;
}
