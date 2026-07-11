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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChecklistService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ChecklistService = class ChecklistService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getChecklistForOrder(orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return this.prisma.orderChecklistItem.findMany({
            where: { orderId },
            orderBy: { orderIndex: 'asc' },
        });
    }
    async addChecklistItem(orderId, label) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const maxItem = await this.prisma.orderChecklistItem.findFirst({
            where: { orderId },
            orderBy: { orderIndex: 'desc' },
        });
        const nextIndex = maxItem ? maxItem.orderIndex + 1 : 0;
        return this.prisma.orderChecklistItem.create({
            data: {
                orderId,
                label,
                orderIndex: nextIndex,
            },
        });
    }
    async updateChecklistItem(id, checked) {
        const item = await this.prisma.orderChecklistItem.findUnique({
            where: { id },
        });
        if (!item)
            throw new common_1.NotFoundException('Checklist item not found');
        return this.prisma.orderChecklistItem.update({
            where: { id },
            data: {
                checked,
                checkedAt: checked ? new Date() : null,
            },
        });
    }
    async deleteChecklistItem(id) {
        const item = await this.prisma.orderChecklistItem.findUnique({
            where: { id },
        });
        if (!item)
            throw new common_1.NotFoundException('Checklist item not found');
        await this.prisma.orderChecklistItem.delete({ where: { id } });
        return { success: true };
    }
    async loadFromTemplate(orderId, templateId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const template = await this.prisma.checklistTemplate.findUnique({
            where: { id: templateId },
            include: { items: true },
        });
        if (!template)
            throw new common_1.NotFoundException('Template not found');
        const currentItems = await this.prisma.orderChecklistItem.findMany({
            where: { orderId },
        });
        const currentLabels = new Set(currentItems.map((i) => i.label.toLowerCase()));
        const maxItem = await this.prisma.orderChecklistItem.findFirst({
            where: { orderId },
            orderBy: { orderIndex: 'desc' },
        });
        let nextIndex = maxItem ? maxItem.orderIndex + 1 : 0;
        const itemsToCreate = [];
        for (const tItem of template.items) {
            if (!currentLabels.has(tItem.label.toLowerCase())) {
                itemsToCreate.push({
                    orderId,
                    label: tItem.label,
                    orderIndex: nextIndex++,
                    checked: false,
                });
            }
        }
        if (itemsToCreate.length > 0) {
            await this.prisma.orderChecklistItem.createMany({
                data: itemsToCreate,
            });
        }
        return this.getChecklistForOrder(orderId);
    }
    async getTemplates() {
        return this.prisma.checklistTemplate.findMany({
            include: { items: { orderBy: { orderIndex: 'asc' } } },
        });
    }
};
exports.ChecklistService = ChecklistService;
exports.ChecklistService = ChecklistService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChecklistService);
//# sourceMappingURL=checklist.service.js.map