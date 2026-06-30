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
exports.MenuItemsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MenuItemsService = class MenuItemsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createMenuItemDto) {
        const { name, category, isVeg, price, description } = createMenuItemDto;
        const existing = await this.prisma.menuItem.findFirst({
            where: {
                name: { equals: name },
                category: { equals: category },
            },
        });
        if (existing) {
            throw new common_1.BadRequestException(`A dish named "${name}" already exists in the "${category}" category.`);
        }
        return this.prisma.menuItem.create({
            data: {
                name,
                category,
                isVeg: isVeg !== undefined ? isVeg : true,
                price,
                description,
            },
        });
    }
    async findAll(query) {
        const search = query.search || '';
        const category = query.category || '';
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (category) {
            where.category = category;
        }
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { description: { contains: search } },
            ];
        }
        const total = await this.prisma.menuItem.count({ where });
        const data = await this.prisma.menuItem.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                name: 'asc',
            },
        });
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const item = await this.prisma.menuItem.findUnique({
            where: { id },
            include: {
                menus: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        if (!item) {
            throw new common_1.NotFoundException(`Menu item with ID ${id} not found.`);
        }
        return item;
    }
    async update(id, updateMenuItemDto) {
        const { name, category, isVeg, price, description, available } = updateMenuItemDto;
        const item = await this.prisma.menuItem.findUnique({ where: { id } });
        if (!item) {
            throw new common_1.NotFoundException(`Menu item with ID ${id} not found.`);
        }
        if (name && (name !== item.name || (category && category !== item.category))) {
            const targetCategory = category || item.category;
            const existing = await this.prisma.menuItem.findFirst({
                where: {
                    name: { equals: name },
                    category: { equals: targetCategory },
                    id: { not: id },
                },
            });
            if (existing) {
                throw new common_1.BadRequestException(`A dish named "${name}" already exists in the "${targetCategory}" category.`);
            }
        }
        return this.prisma.menuItem.update({
            where: { id },
            data: {
                name,
                category,
                isVeg,
                price,
                description,
                available,
            },
        });
    }
    async remove(id) {
        const item = await this.prisma.menuItem.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        orderItems: true,
                    },
                },
            },
        });
        if (!item) {
            throw new common_1.NotFoundException(`Menu item with ID ${id} not found.`);
        }
        if (item._count.orderItems > 0) {
            throw new common_1.BadRequestException(`Cannot delete "${item.name}" because it is referenced in past/active billing orders. Try marking it unavailable instead.`);
        }
        return this.prisma.menuItem.delete({
            where: { id },
        });
    }
};
exports.MenuItemsService = MenuItemsService;
exports.MenuItemsService = MenuItemsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MenuItemsService);
//# sourceMappingURL=menu-items.service.js.map