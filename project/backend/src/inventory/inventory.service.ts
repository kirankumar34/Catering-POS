import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';

export class UpdateInventoryDto {
  itemName?: string;
  currentStock?: number;
  unit?: string;
  lowStockThreshold?: number;
  purchaseCost?: number;
  supplier?: string;
}

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInventoryDto) {
    const existing = await this.prisma.inventory.findUnique({
      where: { itemName: dto.itemName },
    });
    if (existing)
      throw new ConflictException(`Item "${dto.itemName}" already exists`);

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

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    lowStock?: boolean;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 15;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (query.search) where.itemName = { contains: query.search };

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

  async findOne(id: string) {
    const item = await this.prisma.inventory.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Inventory item not found');
    return { ...item, isLowStock: item.currentStock <= item.lowStockThreshold };
  }

  async update(id: string, dto: UpdateInventoryDto) {
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

  async adjustStock(id: string, delta: number) {
    const item = await this.findOne(id);
    const newStock = Math.max(item.currentStock + delta, 0);
    return this.prisma.inventory.update({
      where: { id },
      data: { currentStock: newStock },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.inventory.delete({ where: { id } });
    return { message: 'Item deleted' };
  }
}
