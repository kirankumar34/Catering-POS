import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
export declare class SettingsService implements OnModuleInit {
    private readonly prisma;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    findAll(): Promise<{
        id: string;
        updatedAt: Date;
        value: string;
        key: string;
    }[]>;
    update(key: string, value: string): Promise<{
        id: string;
        updatedAt: Date;
        value: string;
        key: string;
    }>;
    updateBulk(settings: Record<string, string>): Promise<{
        id: string;
        updatedAt: Date;
        value: string;
        key: string;
    }[]>;
}
