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
        username: string;
        email: string | null;
        id: string;
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
        username: string;
        email: string | null;
        id: string;
        passwordHash: string;
        roleId: string;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    findAll(): Promise<{
        role: {
            id: string;
            name: string;
            description: string | null;
        };
        username: string;
        email: string | null;
        id: string;
        createdAt: Date;
    }[]>;
    create(dto: CreateUserDto): Promise<{
        role: {
            id: string;
            name: string;
            description: string | null;
        };
        username: string;
        email: string | null;
        id: string;
        createdAt: Date;
    }>;
    update(id: string, dto: UpdateUserDto): Promise<{
        role: {
            id: string;
            name: string;
            description: string | null;
        };
        username: string;
        email: string | null;
        id: string;
        createdAt: Date;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
