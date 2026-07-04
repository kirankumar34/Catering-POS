import { PrismaService } from '../prisma/prisma.service';
import type { Response } from 'express';
export declare class BillsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private generatePdf;
    generateInvoicePdf(orderId: string, res: Response): Promise<void>;
    generateQuotationPdf(orderId: string, res: Response): Promise<void>;
}
