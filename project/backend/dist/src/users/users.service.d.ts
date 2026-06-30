import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByUsername(username: string): Promise<({
        role: {
            id: string;
            name: string;
            description: string | null;
        };
    } & {
        id: string;
        username: string;
        email: string | null;
        passwordHash: string;
        roleId: string;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    findById(id: string): Promise<({
        role: {
            id: string;
            name: string;
            description: string | null;
        };
    } & {
        id: string;
        username: string;
        email: string | null;
        passwordHash: string;
        roleId: string;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    findAll(): Promise<{
        id: string;
        role: {
            id: string;
            name: string;
            description: string | null;
        };
        username: string;
        email: string | null;
        createdAt: Date;
    }[]>;
    create(dto: CreateUserDto): Promise<{
        id: string;
        role: {
            id: string;
            name: string;
            description: string | null;
        };
        username: string;
        email: string | null;
        createdAt: Date;
    }>;
    update(id: string, dto: UpdateUserDto): Promise<{
        id: string;
        role: {
            id: string;
            name: string;
            description: string | null;
        };
        username: string;
        email: string | null;
        createdAt: Date;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
