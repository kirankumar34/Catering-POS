import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_SETTINGS = [
  { key: 'gstRate', value: '18' },
  { key: 'invoicePrefix', value: 'INV' },
  { key: 'currencySymbol', value: '₹' },
  { key: 'businessName', value: 'Seisuvai Catering' },
  { key: 'proprietorName', value: 'S. Vignesh' },
  { key: 'phone', value: '+91 98765 43210' },
  { key: 'gstin', value: '33ABCDE1234F1Z5' },
  {
    key: 'address',
    value: '123, Gandhi Road, Chennai - 600001, Tamil Nadu, India',
  },
  { key: 'upiId', value: 'kiransmart00-2@okicici' },
];

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    // Seed default settings if empty
    for (const item of DEFAULT_SETTINGS) {
      const existing = await this.prisma.setting.findUnique({
        where: { key: item.key },
      });
      if (!existing) {
        await this.prisma.setting.create({
          data: item,
        });
      }
    }
  }

  async findAll() {
    return this.prisma.setting.findMany();
  }

  async update(key: string, value: string) {
    return this.prisma.setting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  async updateBulk(settings: Record<string, string>) {
    const promises = Object.entries(settings).map(([key, value]) =>
      this.prisma.setting.upsert({
        where: { key },
        create: { key, value: String(value) },
        update: { value: String(value) },
      }),
    );
    await Promise.all(promises);
    return this.findAll();
  }
}
