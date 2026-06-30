import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
export declare class MenuItemsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createMenuItemDto: CreateMenuItemDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        category: string;
        isVeg: boolean;
        price: number;
        available: boolean;
    }>;
    findAll(query: {
        search?: string;
        category?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: {
            id: string;
            name: string;
            description: string | null;
            category: string;
            isVeg: boolean;
            price: number;
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
        price: number;
        available: boolean;
    }>;
    update(id: string, updateMenuItemDto: UpdateMenuItemDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        category: string;
        isVeg: boolean;
        price: number;
        available: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        category: string;
        isVeg: boolean;
        price: number;
        available: boolean;
    }>;
}
