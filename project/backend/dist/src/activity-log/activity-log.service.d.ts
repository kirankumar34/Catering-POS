import { PrismaService } from '../prisma/prisma.service';
export declare class ActivityLogService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    log(userId: string, action: string, details?: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        action: string;
        details: string | null;
    }>;
    findAll(limit?: number): Promise<({
        user: {
            role: {
                name: string;
            };
            username: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        action: string;
        details: string | null;
    })[]>;
}
