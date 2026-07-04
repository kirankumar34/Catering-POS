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
exports.MenusService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MenusService = class MenusService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createMenuDto) {
        const { name, description, pricePerPlate, itemIds } = createMenuDto;
        const existing = await this.prisma.menu.findFirst({
            where: {
                name: { equals: name },
            },
        });
        if (existing) {
            throw new common_1.BadRequestException(`A menu package named "${name}" already exists.`);
        }
        return this.prisma.menu.create({
            data: {
                name,
                description,
                pricePerPlate,
                items: itemIds && itemIds.length > 0 ? {
                    connect: itemIds.map(id => ({ id })),
                } : undefined,
            },
            include: {
                items: true,
            },
        });
    }
    async findAll(query) {
        const search = query.search || '';
        const statusParam = query.status || '';
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (statusParam === 'active') {
            where.status = true;
        }
        else if (statusParam === 'inactive') {
            where.status = false;
        }
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { description: { contains: search } },
            ];
        }
        const total = await this.prisma.menu.count({ where });
        const data = await this.prisma.menu.findMany({
            where,
            skip,
            take: limit,
            include: {
                _count: {
                    select: {
                        items: true,
                        orders: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
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
        const menu = await this.prisma.menu.findUnique({
            where: { id },
            include: {
                items: {
                    orderBy: {
                        name: 'asc',
                    },
                },
            },
        });
        if (!menu) {
            throw new common_1.NotFoundException(`Menu package with ID ${id} not found.`);
        }
        return menu;
    }
    async update(id, updateMenuDto) {
        const { name, description, pricePerPlate, status, itemIds } = updateMenuDto;
        const menu = await this.prisma.menu.findUnique({ where: { id } });
        if (!menu) {
            throw new common_1.NotFoundException(`Menu package with ID ${id} not found.`);
        }
        if (name && name !== menu.name) {
            const existing = await this.prisma.menu.findFirst({
                where: {
                    name: { equals: name },
                    id: { not: id },
                },
            });
            if (existing) {
                throw new common_1.BadRequestException(`A menu package named "${name}" already exists.`);
            }
        }
        return this.prisma.menu.update({
            where: { id },
            data: {
                name,
                description,
                pricePerPlate,
                status,
                items: itemIds !== undefined ? {
                    set: itemIds.map(itemId => ({ id: itemId })),
                } : undefined,
            },
            include: {
                items: true,
            },
        });
    }
    async remove(id) {
        const menu = await this.prisma.menu.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        orders: true,
                    },
                },
            },
        });
        if (!menu) {
            throw new common_1.NotFoundException(`Menu package with ID ${id} not found.`);
        }
        if (menu._count.orders > 0) {
            throw new common_1.BadRequestException(`Cannot delete "${menu.name}" because it is active in order transaction history. Try marking it inactive instead.`);
        }
        return this.prisma.menu.delete({
            where: { id },
        });
    }
};
exports.MenusService = MenusService;
exports.MenusService = MenusService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MenusService);
//# sourceMappingURL=menus.service.js.map