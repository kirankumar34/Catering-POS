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
exports.InventoryService = exports.UpdateInventoryDto = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
class UpdateInventoryDto {
    itemName;
    currentStock;
    unit;
    lowStockThreshold;
    purchaseCost;
    supplier;
}
exports.UpdateInventoryDto = UpdateInventoryDto;
let InventoryService = class InventoryService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const existing = await this.prisma.inventory.findUnique({
            where: { itemName: dto.itemName },
        });
        if (existing)
            throw new common_1.ConflictException(`Item "${dto.itemName}" already exists`);
        return this.prisma.inventory.create({
            data: {
                itemName: dto.itemName,
                currentStock: dto.currentStock ?? 0,
                unit: dto.unit,
                lowStockThreshold: dto.lowStockThreshold ?? 5,
                purchaseCost: dto.purchaseCost ?? 0,
                supplier: dto.supplier ?? null,
            },
        });
    }
    async findAll(query) {
        const page = query.page || 1;
        const limit = query.limit || 15;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.search)
            where.itemName = { contains: query.search };
        const [total, data] = await this.prisma.$transaction([
            this.prisma.inventory.count({ where }),
            this.prisma.inventory.findMany({
                where,
                skip,
                take: limit,
                orderBy: { itemName: 'asc' },
            }),
        ]);
        const result = data.map((item) => ({
            ...item,
            isLowStock: item.currentStock <= item.lowStockThreshold,
        }));
        const filtered = query.lowStock
            ? result.filter((i) => i.isLowStock)
            : result;
        return {
            data: query.lowStock ? filtered : result,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
            lowStockCount: result.filter((i) => i.isLowStock).length,
        };
    }
    async findOne(id) {
        const item = await this.prisma.inventory.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Inventory item not found');
        return { ...item, isLowStock: item.currentStock <= item.lowStockThreshold };
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.inventory.update({
            where: { id },
            data: {
                ...(dto.itemName && { itemName: dto.itemName }),
                ...(dto.currentStock !== undefined && {
                    currentStock: dto.currentStock,
                }),
                ...(dto.unit && { unit: dto.unit }),
                ...(dto.lowStockThreshold !== undefined && {
                    lowStockThreshold: dto.lowStockThreshold,
                }),
                ...(dto.purchaseCost !== undefined && {
                    purchaseCost: dto.purchaseCost,
                }),
                ...(dto.supplier !== undefined && { supplier: dto.supplier }),
            },
        });
    }
    async adjustStock(id, delta) {
        const item = await this.findOne(id);
        const newStock = Math.max(item.currentStock + delta, 0);
        return this.prisma.inventory.update({
            where: { id },
            data: { currentStock: newStock },
        });
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.inventory.delete({ where: { id } });
        return { message: 'Item deleted' };
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map