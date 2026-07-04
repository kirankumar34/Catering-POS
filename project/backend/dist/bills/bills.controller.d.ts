import type { Response } from 'express';
import { BillsService } from './bills.service';
export declare class BillsController {
    private readonly billsService;
    constructor(billsService: BillsService);
    generateInvoice(orderId: string, res: Response): Promise<void>;
    generateQuotation(orderId: string, res: Response): Promise<void>;
}
