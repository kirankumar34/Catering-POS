import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenusService {
  constructor(private prisma: PrismaService) {}

  async create(createMenuDto: CreateMenuDto) {
    const { name, description, pricePerPlate, itemIds } = createMenuDto;

    // 1. Check duplicate package name
    const existing = await this.prisma.menu.findFirst({
      where: {
        name: { equals: name },
      },
    });

    if (existing) {
      throw new BadRequestException(`A menu package named "${name}" already exists.`);
    }

    // 2. Create and connect items
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

  async findAll(query: { search?: string; status?: string; page?: number; limit?: number }) {
    const search = query.search || '';
    const statusParam = query.status || '';
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (statusParam === 'active') {
      where.status = true;
    } else if (statusParam === 'inactive') {
      where.status = false;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Count packages
    const total = await this.prisma.menu.count({ where });

    // Fetch packages
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

  async findOne(id: string) {
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
      throw new NotFoundException(`Menu package with ID ${id} not found.`);
    }

    return menu;
  }

  async update(id: string, updateMenuDto: UpdateMenuDto) {
    const { name, description, pricePerPlate, status, itemIds } = updateMenuDto;

    // Check existence
    const menu = await this.prisma.menu.findUnique({ where: { id } });
    if (!menu) {
      throw new NotFoundException(`Menu package with ID ${id} not found.`);
    }

    // Check duplicate name
    if (name && name !== menu.name) {
      const existing = await this.prisma.menu.findFirst({
        where: {
          name: { equals: name },
          id: { not: id },
        },
      });

      if (existing) {
        throw new BadRequestException(`A menu package named "${name}" already exists.`);
      }
    }

    // Update fields and reset item associations
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

  async remove(id: string) {
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
      throw new NotFoundException(`Menu package with ID ${id} not found.`);
    }

    // Block deletion if referenced by existing catering orders
    if (menu._count.orders > 0) {
      throw new BadRequestException(
        `Cannot delete "${menu.name}" because it is active in order transaction history. Try marking it inactive instead.`
      );
    }

    // Delete package
    return this.prisma.menu.delete({
      where: { id },
    });
  }
}
