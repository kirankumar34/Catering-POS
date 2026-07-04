"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const schedule_1 = require("@nestjs/schedule");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    prisma;
    logger = new common_1.Logger(NotificationsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async handleCronReminders() {
        this.logger.log('Starting daily event reminder checks (T-1/T-2)...');
        await this.checkReminders();
    }
    async checkReminders() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const oneDayInMs = 24 * 60 * 60 * 1000;
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
                if (created)
                    createdCount++;
            }
            else if (diffDays === 2) {
                const type = 'EVENT_REMINDER_2D';
                const message = `Event Alert: "${order.orderNumber}" for ${order.customer.name} is in 2 days (${new Date(order.eventDate).toLocaleDateString('en-IN')}).`;
                const created = await this.createNotification(order.id, type, message);
                if (created)
                    createdCount++;
            }
        }
        this.logger.log(`Reminder check completed. Created ${createdCount} notification(s).`);
        return { status: 'success', created: createdCount };
    }
    async createNotification(orderId, type, message) {
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
    async markAsRead(id) {
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
};
exports.NotificationsService = NotificationsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_8AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsService.prototype, "handleCronReminders", null);
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map