import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      include: { role: true },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: dto.username },
          ...(dto.email ? [{ email: dto.email }] : []),
        ],
      },
    });

    if (existing) {
      throw new BadRequestException('Username or email already exists');
    }

    const role = await this.prisma.role.findUnique({
      where: { name: dto.roleName },
    });
    if (!role) throw new NotFoundException(`Role ${dto.roleName} not found`);

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email || null,
        passwordHash,
        roleId: role.id,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const updateData: Record<string, any> = {};

    if (dto.email !== undefined) {
      if (dto.email) {
        const emailExists = await this.prisma.user.findFirst({
          where: { email: dto.email, id: { not: id } },
        });
        if (emailExists) throw new BadRequestException('Email already in use');
      }
      updateData.email = dto.email || null;
    }

    if (dto.password) {
      updateData.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    if (dto.roleName) {
      const role = await this.prisma.role.findUnique({
        where: { name: dto.roleName },
      });
      if (!role) throw new NotFoundException(`Role ${dto.roleName} not found`);
      updateData.roleId = role.id;
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    // Prevent deletion of first/last remaining super admins
    const count = await this.prisma.user.count({
      where: { role: { name: 'SUPER_ADMIN' } },
    });
    const targetUser = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (targetUser?.role.name === 'SUPER_ADMIN' && count <= 1) {
      throw new BadRequestException(
        'Cannot delete the last remaining Super Admin',
      );
    }

    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully' };
  }
}
