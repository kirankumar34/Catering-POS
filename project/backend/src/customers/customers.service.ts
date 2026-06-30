import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto) {
    const { name, phone, altPhone, email, gstNumber, notes, addresses } = createCustomerDto;

    // 1. Check phone duplicate
    const existingPhone = await this.prisma.customer.findUnique({
      where: { phone },
    });
    if (existingPhone) {
      throw new BadRequestException('Phone number is already registered.');
    }

    // 2. Check email duplicate (if provided)
    if (email) {
      const existingEmail = await this.prisma.customer.findFirst({
        where: { email },
      });
      if (existingEmail) {
        throw new BadRequestException('Email address is already registered.');
      }
    }

    // 3. Check GST duplicate (if provided)
    if (gstNumber) {
      const existingGst = await this.prisma.customer.findFirst({
        where: { gstNumber },
      });
      if (existingGst) {
        throw new BadRequestException('GST number is already registered.');
      }
    }

    // 4. Create customer
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

  async findAll(query: { search?: string; page?: number; limit?: number }) {
    const search = query.search || '';
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

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

    // Fetch total matching records
    const total = await this.prisma.customer.count({ where });

    // Fetch records with pagination
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

  async findOne(id: string) {
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
      throw new NotFoundException(`Customer with ID ${id} not found.`);
    }

    // Calculate aggregated statistics
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

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const { name, phone, altPhone, email, gstNumber, notes, addresses } = updateCustomerDto;

    // Check if customer exists
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found.`);
    }

    // Check phone duplicate
    if (phone && phone !== customer.phone) {
      const existingPhone = await this.prisma.customer.findUnique({ where: { phone } });
      if (existingPhone) {
        throw new BadRequestException('Phone number is already in use by another customer.');
      }
    }

    // Check email duplicate
    if (email && email !== customer.email) {
      const existingEmail = await this.prisma.customer.findFirst({ where: { email } });
      if (existingEmail) {
        throw new BadRequestException('Email address is already in use by another customer.');
      }
    }

    // Check GST duplicate
    if (gstNumber && gstNumber !== customer.gstNumber) {
      const existingGst = await this.prisma.customer.findFirst({ where: { gstNumber } });
      if (existingGst) {
        throw new BadRequestException('GST number is already in use by another customer.');
      }
    }

    // Update customer and sync addresses
    return this.prisma.$transaction(async (tx) => {
      // If addresses are provided, replace them
      if (addresses !== undefined) {
        // Delete all old addresses
        await tx.customerAddress.deleteMany({
          where: { customerId: id },
        });

        // Recreate new addresses
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

      // Update main customer profile
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

  async remove(id: string) {
    // Check if customer exists
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
      throw new NotFoundException(`Customer with ID ${id} not found.`);
    }

    // Prevent deletion if customer has orders
    if (customer._count.orders > 0) {
      throw new BadRequestException(
        'Cannot delete customer with active order history. Archive or cancel their orders first.'
      );
    }

    // Delete customer addresses (cascades automatically via prisma relations, but doing transaction is clean)
    return this.prisma.$transaction(async (tx) => {
      await tx.customerAddress.deleteMany({
        where: { customerId: id },
      });

      return tx.customer.delete({
        where: { id },
      });
    });
  }
}
