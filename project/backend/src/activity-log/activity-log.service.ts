import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityLogService {
  constructor(private readonly prisma: PrismaService) {}

  async log(userId: string, action: string, details?: string) {
    return this.prisma.activityLog.create({
      data: {
        userId,
        action,
        details: details || null,
      },
    });
  }

  async findAll(limit = 50) {
    return this.prisma.activityLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            username: true,
            role: { select: { name: true } },
          },
        },
      },
    });
  }
}
