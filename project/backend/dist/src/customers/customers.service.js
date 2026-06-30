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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CustomersService = class CustomersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createCustomerDto) {
        const { name, phone, altPhone, email, gstNumber, notes, addresses } = createCustomerDto;
        const existingPhone = await this.prisma.customer.findUnique({
            where: { phone },
        });
        if (existingPhone) {
            throw new common_1.BadRequestException('Phone number is already registered.');
        }
        if (email) {
            const existingEmail = await this.prisma.customer.findFirst({
                where: { email },
            });
            if (existingEmail) {
                throw new common_1.BadRequestException('Email address is already registered.');
            }
        }
        if (gstNumber) {
            const existingGst = await this.prisma.customer.findFirst({
                where: { gstNumber },
            });
            if (existingGst) {
                throw new common_1.BadRequestException('GST number is already registered.');
            }
        }
        return this.prisma.customer.create({
            data: {
                name,
                phone,
                altPhone,
                email,
                gstNumber,
                notes,
                addresses: addresses && addresses.length > 0 ? {
                    create: addresses.map(addr => ({
                        address: addr.address,
                        location: addr.location,
                        isDefault: addr.isDefault !== undefined ? addr.isDefault : false,
                    })),
                } : undefined,
            },
            include: {
                addresses: true,
            },
        });
    }
    async findAll(query) {
        const search = query.search || '';
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { phone: { contains: search } },
                { email: { contains: search } },
                { gstNumber: { contains: search } },
                {
                    addresses: {
                        some: {
                            address: { contains: search },
                        },
                    },
                },
            ];
        }
        const total = await this.prisma.customer.count({ where });
        const data = await this.prisma.customer.findMany({
            where,
            skip,
            take: limit,
            include: {
                addresses: true,
                _count: {
                    select: {
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
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            include: {
                addresses: true,
                orders: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    include: {
                        bills: true,
                        payments: true,
                    },
                },
            },
        });
        if (!customer) {
            throw new common_1.NotFoundException(`Customer with ID ${id} not found.`);
        }
        let totalSpending = 0;
        let pendingBalance = 0;
        customer.orders.forEach(order => {
            totalSpending += order.grandTotal;
            pendingBalance += order.pendingAmount;
        });
        return {
            ...customer,
            stats: {
                totalOrders: customer.orders.length,
                totalSpending,
                pendingBalance,
            },
        };
    }
    async update(id, updateCustomerDto) {
        const { name, phone, altPhone, email, gstNumber, notes, addresses } = updateCustomerDto;
        const customer = await this.prisma.customer.findUnique({ where: { id } });
        if (!customer) {
            throw new common_1.NotFoundException(`Customer with ID ${id} not found.`);
        }
        if (phone && phone !== customer.phone) {
            const existingPhone = await this.prisma.customer.findUnique({ where: { phone } });
            if (existingPhone) {
                throw new common_1.BadRequestException('Phone number is already in use by another customer.');
            }
        }
        if (email && email !== customer.email) {
            const existingEmail = await this.prisma.customer.findFirst({ where: { email } });
            if (existingEmail) {
                throw new common_1.BadRequestException('Email address is already in use by another customer.');
            }
        }
        if (gstNumber && gstNumber !== customer.gstNumber) {
            const existingGst = await this.prisma.customer.findFirst({ where: { gstNumber } });
            if (existingGst) {
                throw new common_1.BadRequestException('GST number is already in use by another customer.');
            }
        }
        return this.prisma.$transaction(async (tx) => {
            if (addresses !== undefined) {
                await tx.customerAddress.deleteMany({
                    where: { customerId: id },
                });
                if (addresses.length > 0) {
                    await tx.customerAddress.createMany({
                        data: addresses.map(addr => ({
                            customerId: id,
                            address: addr.address,
                            location: addr.location,
                            isDefault: addr.isDefault !== undefined ? addr.isDefault : false,
                        })),
                    });
                }
            }
            return tx.customer.update({
                where: { id },
                data: {
                    name,
                    phone,
                    altPhone,
                    email,
                    gstNumber,
                    notes,
                },
                include: {
                    addresses: true,
                },
            });
        });
    }
    async remove(id) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        orders: true,
                    },
                },
            },
        });
        if (!customer) {
            throw new common_1.NotFoundException(`Customer with ID ${id} not found.`);
        }
        if (customer._count.orders > 0) {
            throw new common_1.BadRequestException('Cannot delete customer with active order history. Archive or cancel their orders first.');
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.customerAddress.deleteMany({
                where: { customerId: id },
            });
            return tx.customer.delete({
                where: { id },
            });
        });
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map