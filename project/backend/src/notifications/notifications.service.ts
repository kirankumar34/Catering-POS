import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Cron runs every day at 8:00 AM
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleCronReminders() {
    this.logger.log('Starting daily event reminder checks (T-1/T-2)...');
    await this.checkReminders();
  }

  async checkReminders() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const oneDayInMs = 24 * 60 * 60 * 1000;

    // Fetch active orders eventDate range [today + 1 day, today + 3 days]
    const orders = await this.prisma.order.findMany({
      where: {
        status: { notIn: ['CANCELLED', 'COMPLETED'] },
        eventDate: {
          gte: new Date(today.getTime() + oneDayInMs),
          lte: new Date(today.getTime() + 3 * oneDayInMs),
        },
      },
      include: { customer: true },
    });

    let createdCount = 0;

    for (const order of orders) {
      const eventDateClean = new Date(order.eventDate);
      eventDateClean.setHours(0, 0, 0, 0);

      const diffMs = eventDateClean.getTime() - today.getTime();
      const diffDays = Math.round(diffMs / oneDayInMs);

      if (diffDays === 1) {
        const type = 'EVENT_REMINDER_1D';
        const message = `Event Alert: "${order.orderNumber}" for ${order.customer.name} is tomorrow (${new Date(order.eventDate).toLocaleDateString('en-IN')})!`;
        const created = await this.createNotification(order.id, type, message);
        if (created) createdCount++;
      } else if (diffDays === 2) {
        const type = 'EVENT_REMINDER_2D';
        const message = `Event Alert: "${order.orderNumber}" for ${order.customer.name} is in 2 days (${new Date(order.eventDate).toLocaleDateString('en-IN')}).`;
        const created = await this.createNotification(order.id, type, message);
        if (created) createdCount++;
      }
    }

    this.logger.log(`Reminder check completed. Created ${createdCount} notification(s).`);
    return { status: 'success', created: createdCount };
  }

  private async createNotification(orderId: string, type: string, message: string): Promise<boolean> {
    const existing = await this.prisma.notification.findFirst({
      where: { orderId, type },
    });

    if (!existing) {
      await this.prisma.notification.create({
        data: { orderId, type, message },
      });
      return true;
    }
    return false;
  }

  async findAll() {
    return this.prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          select: {
            orderNumber: true,
            eventDate: true,
            customer: { select: { name: true } },
          },
        },
      },
    });
  }

  async findUnread() {
    return this.prisma.notification.findMany({
      where: { read: false },
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          select: {
            orderNumber: true,
            eventDate: true,
            customer: { select: { name: true } },
          },
        },
      },
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllAsRead() {
    return this.prisma.notification.updateMany({
      where: { read: false },
      data: { read: true },
    });
  }
}
