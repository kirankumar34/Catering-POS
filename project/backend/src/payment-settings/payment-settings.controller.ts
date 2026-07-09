import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PaymentSettingsService } from './payment-settings.service';
import { CreatePaymentSettingDto, UpdatePaymentSettingDto } from './dto/payment-setting.dto';

// Ensure the directory exists at startup
fs.mkdirSync('./uploads/payment', { recursive: true });

@Controller('payment-settings')
export class PaymentSettingsController {
  constructor(private readonly paymentSettingsService: PaymentSettingsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.paymentSettingsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'OWNER')
  async create(@Body() dto: CreatePaymentSettingDto, @Request() req: any) {
    return this.paymentSettingsService.create(dto, req.user.userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'OWNER')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentSettingDto,
    @Request() req: any,
  ) {
    return this.paymentSettingsService.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'OWNER')
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.paymentSettingsService.remove(id, req.user.userId);
  }

  @Patch('default/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'OWNER')
  async setDefault(@Param('id') id: string, @Request() req: any) {
    return this.paymentSettingsService.setDefault(id, req.user.userId);
  }

  @Post('upload-qr')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'OWNER')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/payment',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `qr-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|svg|svg\+xml)$/)) {
          return cb(new BadRequestException('Only PNG, JPG, and SVG files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadQr(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded or file format is invalid.');
    }
    return { qrImageUrl: `/uploads/payment/${file.filename}` };
  }
}
