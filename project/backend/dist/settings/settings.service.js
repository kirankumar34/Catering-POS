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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
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
let SettingsService = class SettingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
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
    async update(key, value) {
        return this.prisma.setting.upsert({
            where: { key },
            create: { key, value },
            update: { value },
        });
    }
    async updateBulk(settings) {
        const promises = Object.entries(settings).map(([key, value]) => this.prisma.setting.upsert({
            where: { key },
            create: { key, value: String(value) },
            update: { value: String(value) },
        }));
        await Promise.all(promises);
        return this.findAll();
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map