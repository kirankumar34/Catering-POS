import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class MenuItemsService {
  constructor(private prisma: PrismaService) {}

  async create(createMenuItemDto: CreateMenuItemDto) {
    const { name, category, isVeg, price, description } = createMenuItemDto;

    // 1. Check duplicate item name in the same category
    const existing = await this.prisma.menuItem.findFirst({
      where: {
        name: { equals: name },
        category: { equals: category },
      },
    });

    if (existing) {
      throw new BadRequestException(
        `A dish named "${name}" already exists in the "${category}" category.`,
      );
    }

    // 2. Create item
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

  async findAll(query: {
    search?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) {
    const search = query.search || '';
    const category = query.category || '';
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Count records
    const total = await this.prisma.menuItem.count({ where });

    // Fetch records
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

  async findOne(id: string) {
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
      throw new NotFoundException(`Menu item with ID ${id} not found.`);
    }

    return item;
  }

  async update(id: string, updateMenuItemDto: UpdateMenuItemDto) {
    const { name, category, isVeg, price, description, available } =
      updateMenuItemDto;

    // Check existence
    const item = await this.prisma.menuItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Menu item with ID ${id} not found.`);
    }

    // Check duplicate name if changing name
    if (
      name &&
      (name !== item.name || (category && category !== item.category))
    ) {
      const targetCategory = category || item.category;
      const existing = await this.prisma.menuItem.findFirst({
        where: {
          name: { equals: name },
          category: { equals: targetCategory },
          id: { not: id },
        },
      });

      if (existing) {
        throw new BadRequestException(
          `A dish named "${name}" already exists in the "${targetCategory}" category.`,
        );
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

  async remove(id: string) {
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
      throw new NotFoundException(`Menu item with ID ${id} not found.`);
    }

    // Block deletion if referenced by existing catering orders
    if (item._count.orderItems > 0) {
      throw new BadRequestException(
        `Cannot delete "${item.name}" because it is referenced in past/active billing orders. Try marking it unavailable instead.`,
      );
    }

    // Delete item (implicitly unlinks from any Menu join tables due to Cascade or automatic join table management)
    return this.prisma.menuItem.delete({
      where: { id },
    });
  }
}
