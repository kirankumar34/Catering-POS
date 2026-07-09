import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentSettingDto, UpdatePaymentSettingDto } from './dto/payment-setting.dto';

@Injectable()
export class PaymentSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.paymentSetting.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findDefault() {
    return this.prisma.paymentSetting.findFirst({
      where: { isDefault: true },
    });
  }

  async create(dto: CreatePaymentSettingDto, userId: string) {
    if (dto.isDefault) {
      await this.prisma.paymentSetting.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const newSetting = await this.prisma.paymentSetting.create({
      data: {
        accountHolderName: dto.accountHolderName,
        bankName: dto.bankName,
        accountNumber: dto.accountNumber,
        ifscCode: dto.ifscCode,
        branchName: dto.branchName,
        swiftCode: dto.swiftCode || null,
        accountType: dto.accountType || null,
        upiId: dto.upiId || null,
        phone: dto.phone || null,
        gpayNumber: dto.gpayNumber || null,
        phonepeNumber: dto.phonepeNumber || null,
        paytmNumber: dto.paytmNumber || null,
        qrImage: dto.qrImage || null,
        instructions: dto.instructions || null,
        showBank: dto.showBank ?? true,
        showQR: dto.showQR ?? true,
        showUPI: dto.showUPI ?? true,
        showInstructions: dto.showInstructions ?? true,
        showAccountHolder: dto.showAccountHolder ?? true,
        showBranch: dto.showBranch ?? true,
        showIFSC: dto.showIFSC ?? true,
        isDefault: dto.isDefault ?? false,
        activePaymentMethod: dto.activePaymentMethod ?? 'Bank + UPI',
      },
    });

    // Write audit log (best-effort, don't fail the main operation)
    try {
      await this.prisma.activityLog.create({
        data: {
          userId,
          action: 'CREATE_PAYMENT_SETTING',
          details: `Created payment setting for ${newSetting.bankName} (${newSetting.accountNumber}). Values: ${JSON.stringify(newSetting)}`,
        },
      });
    } catch (e) {
      console.error('Failed to write audit log for CREATE_PAYMENT_SETTING:', e);
    }

    return newSetting;
  }

  async update(id: string, dto: UpdatePaymentSettingDto, userId: string) {
    const existing = await this.prisma.paymentSetting.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Payment setting with ID ${id} not found.`);
    }

    if (dto.isDefault && !existing.isDefault) {
      await this.prisma.paymentSetting.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const updated = await this.prisma.paymentSetting.update({
      where: { id },
      data: {
        accountHolderName: dto.accountHolderName,
        bankName: dto.bankName,
        accountNumber: dto.accountNumber,
        ifscCode: dto.ifscCode,
        branchName: dto.branchName,
        swiftCode: dto.swiftCode !== undefined ? dto.swiftCode : undefined,
        accountType: dto.accountType !== undefined ? dto.accountType : undefined,
        upiId: dto.upiId !== undefined ? dto.upiId : undefined,
        phone: dto.phone !== undefined ? dto.phone : undefined,
        gpayNumber: dto.gpayNumber !== undefined ? dto.gpayNumber : undefined,
        phonepeNumber: dto.phonepeNumber !== undefined ? dto.phonepeNumber : undefined,
        paytmNumber: dto.paytmNumber !== undefined ? dto.paytmNumber : undefined,
        qrImage: dto.qrImage !== undefined ? dto.qrImage : undefined,
        instructions: dto.instructions !== undefined ? dto.instructions : undefined,
        showBank: dto.showBank,
        showQR: dto.showQR,
        showUPI: dto.showUPI,
        showInstructions: dto.showInstructions,
        showAccountHolder: dto.showAccountHolder,
        showBranch: dto.showBranch,
        showIFSC: dto.showIFSC,
        isDefault: dto.isDefault,
        activePaymentMethod: dto.activePaymentMethod,
      },
    });

    // Write audit log (best-effort)
    try {
      await this.prisma.activityLog.create({
        data: {
          userId,
          action: 'UPDATE_PAYMENT_SETTING',
          details: `Updated payment setting ID ${id}. Previous: ${JSON.stringify(existing)}, New: ${JSON.stringify(updated)}`,
        },
      });
    } catch (e) {
      console.error('Failed to write audit log for UPDATE_PAYMENT_SETTING:', e);
    }

    return updated;
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.paymentSetting.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Payment setting with ID ${id} not found.`);
    }

    await this.prisma.paymentSetting.delete({
      where: { id },
    });

    // Write audit log (best-effort)
    try {
      await this.prisma.activityLog.create({
        data: {
          userId,
          action: 'DELETE_PAYMENT_SETTING',
          details: `Deleted payment setting ID ${id} for ${existing.bankName} (${existing.accountNumber})`,
        },
      });
    } catch (e) {
      console.error('Failed to write audit log for DELETE_PAYMENT_SETTING:', e);
    }

    // If we deleted the default, set another one as default automatically
    if (existing.isDefault) {
      const remaining = await this.prisma.paymentSetting.findFirst();
      if (remaining) {
        await this.prisma.paymentSetting.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        });
      }
    }

    return { success: true };
  }

  async setDefault(id: string, userId: string) {
    const existing = await this.prisma.paymentSetting.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Payment setting with ID ${id} not found.`);
    }

    await this.prisma.$transaction([
      this.prisma.paymentSetting.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      }),
      this.prisma.paymentSetting.update({
        where: { id },
        data: { isDefault: true },
      }),
    ]);

    // Write audit log (best-effort)
    try {
      await this.prisma.activityLog.create({
        data: {
          userId,
          action: 'SET_DEFAULT_PAYMENT_SETTING',
          details: `Set payment setting ID ${id} (${existing.bankName}) as default`,
        },
      });
    } catch (e) {
      console.error('Failed to write audit log for SET_DEFAULT_PAYMENT_SETTING:', e);
    }

    return { success: true };
  }
}
