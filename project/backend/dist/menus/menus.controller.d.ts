import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
export declare class MenusController {
    private readonly menusService;
    constructor(menusService: MenusService);
    create(createMenuDto: CreateMenuDto): Promise<{
        items: {
            id: string;
            name: string;
            description: string | null;
            category: string;
            isVeg: boolean;
            price: import("@prisma/client/runtime/library").Decimal;
            available: boolean;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        pricePerPlate: import("@prisma/client/runtime/library").Decimal;
        status: boolean;
    }>;
    findAll(search?: string, status?: string, page?: string, limit?: string): Promise<{
        data: ({
            _count: {
                orders: number;
                items: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            pricePerPlate: import("@prisma/client/runtime/library").Decimal;
            status: boolean;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        items: {
            id: string;
            name: string;
            description: string | null;
            category: string;
            isVeg: boolean;
            price: import("@prisma/client/runtime/library").Decimal;
            available: boolean;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        pricePerPlate: import("@prisma/client/runtime/library").Decimal;
        status: boolean;
    }>;
    update(id: string, updateMenuDto: UpdateMenuDto): Promise<{
        items: {
            id: string;
            name: string;
            description: string | null;
            category: string;
            isVeg: boolean;
            price: import("@prisma/client/runtime/library").Decimal;
            available: boolean;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        pricePerPlate: import("@prisma/client/runtime/library").Decimal;
        status: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        pricePerPlate: import("@prisma/client/runtime/library").Decimal;
        status: boolean;
    }>;
}
