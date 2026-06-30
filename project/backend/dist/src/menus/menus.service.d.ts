import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
export declare class MenusService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createMenuDto: CreateMenuDto): Promise<{
        items: {
            id: string;
            name: string;
            description: string | null;
            category: string;
            isVeg: boolean;
            price: number;
            available: boolean;
        }[];
    } & {
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        pricePerPlate: number;
        status: boolean;
    }>;
    findAll(query: {
        search?: string;
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: ({
            _count: {
                orders: number;
                items: number;
            };
        } & {
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            pricePerPlate: number;
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
            price: number;
            available: boolean;
        }[];
    } & {
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        pricePerPlate: number;
        status: boolean;
    }>;
    update(id: string, updateMenuDto: UpdateMenuDto): Promise<{
        items: {
            id: string;
            name: string;
            description: string | null;
            category: string;
            isVeg: boolean;
            price: number;
            available: boolean;
        }[];
    } & {
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        pricePerPlate: number;
        status: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        pricePerPlate: number;
        status: boolean;
    }>;
}
