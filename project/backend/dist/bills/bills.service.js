"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const COMPANY = {
    name: 'SEISUVAI CATERING',
    tagline: 'Quality Catering Services',
    proprietor: 'Prop: S. Vignesh',
    phone: '+91 98765 43210',
    website: 'seisuvai catering.netlify.app',
    address: '123, Gandhi Road, Chennai - 600001, Tamil Nadu, India',
    bank: {
        accountName: 'Seisuvai Catering Services',
        accountNumber: '9876543210',
        ifscCode: 'BANK0012345',
        branch: 'Chennai Main',
        upiId: 'seisuvai.catering@upi',
    },
    terms: [
        'Advance payment of 50% is required to confirm the booking.',
        'Final head count must be confirmed 3 days prior to the event.',
        'Cancellation must be informed at least 7 days in advance.',
        'Taxes are extra as applicable.',
    ],
};
const GOLD = '#C9A54E';
const GOLD_DARK = '#A88B3D';
const BLACK = '#1A1A1A';
const DARK_GRAY = '#333333';
const LIGHT_GRAY = '#666666';
const TABLE_HEADER_BG = '#2C2C2C';
const TABLE_ALT_BG = '#F9F6EE';
const WHITE = '#FFFFFF';
const BORDER_GOLD = '#D4A843';
let BillsService = class BillsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generatePdf(orderId, res, docType) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                customer: { include: { addresses: { where: { isDefault: true }, take: 1 } } },
                menu: { include: { items: true } },
                items: { include: { item: { select: { name: true, category: true, isVeg: true, description: true } } } },
                bills: { orderBy: { createdAt: 'desc' }, take: 1 },
            },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const settings = await this.prisma.setting.findMany();
        const settingsMap = new Map(settings.map((s) => [s.key, s.value]));
        const getSetting = (key, defaultValue) => settingsMap.get(key) || defaultValue;
        const bizName = getSetting('businessName', COMPANY.name);
        const bizAddress = getSetting('address', COMPANY.address);
        const bizPhone = getSetting('phone', COMPANY.phone);
        const bizGstin = settingsMap.get('gstin');
        const bizProprietor = getSetting('proprietorName', COMPANY.proprietor);
        const bizUpiId = getSetting('upiId', COMPANY.bank.upiId);
        let docNumber;
        if (docType === 'INVOICE') {
            docNumber = order.bills[0]?.invoiceNumber || '';
            if (!docNumber) {
                const year = new Date().getFullYear();
                const prefix = `INV-${year}-`;
                const lastBill = await this.prisma.bill.findFirst({
                    where: { invoiceNumber: { startsWith: prefix } },
                    orderBy: { createdAt: 'desc' },
                });
                const seq = lastBill ? parseInt(lastBill.invoiceNumber.split('-')[2], 10) + 1 : 1;
                docNumber = `${prefix}${String(seq).padStart(4, '0')}`;
                await this.prisma.bill.create({
                    data: {
                        invoiceNumber: docNumber, orderId, billDate: new Date(),
                        grandTotal: order.grandTotal, amountPaid: order.advancePaid, pendingAmount: order.pendingAmount,
                    },
                });
            }
        }
        else {
            const year = new Date().getFullYear();
            docNumber = `QTN-${year}-${order.orderNumber.split('-').pop()}`;
        }
        const upiLink = `upi://pay?pa=${bizUpiId}&pn=${encodeURIComponent(getSetting('bankAccountName', bizName))}&am=${order.pendingAmount > 0 ? order.pendingAmount : order.grandTotal}&cu=INR&tn=${encodeURIComponent(docNumber)}`;
        let qrBuffer = null;
        try {
            const qrDataUrl = await QRCode.toDataURL(upiLink, { width: 120, margin: 1 });
            const base64 = qrDataUrl.split(',')[1];
            qrBuffer = Buffer.from(base64, 'base64');
        }
        catch {
        }
        const doc = new PDFDocument({ size: 'A4', margins: { top: 40, bottom: 0, left: 40, right: 40 } });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${docNumber}.pdf"`);
        doc.pipe(res);
        const PW = 595.28;
        const PH = 841.89;
        const M = 40;
        const W = PW - M * 2;
        const drawLine = (y, color = GOLD, width = W) => {
            doc.moveTo(M, y).lineTo(M + width, y).strokeColor(color).lineWidth(0.5).stroke();
        };
        const drawDottedLine = (x1, y, x2) => {
            doc.moveTo(x1, y).lineTo(x2, y).dash(2, { space: 2 }).strokeColor(LIGHT_GRAY).lineWidth(0.3).stroke().undash();
        };
        const cornerSize = 60;
        doc.polygon([0, 0], [cornerSize, 0], [0, cornerSize]).fill(GOLD);
        doc.polygon([0, 0], [cornerSize * 0.6, 0], [0, cornerSize * 0.6]).fill(BLACK);
        doc.polygon([PW, 0], [PW - cornerSize, 0], [PW, cornerSize]).fill(GOLD);
        doc.polygon([PW, 0], [PW - cornerSize * 0.6, 0], [PW, cornerSize * 0.6]).fill(BLACK);
        doc.polygon([0, PH], [cornerSize, PH], [0, PH - cornerSize]).fill(GOLD);
        doc.polygon([0, PH], [cornerSize * 0.6, PH], [0, PH - cornerSize * 0.6]).fill(BLACK);
        doc.polygon([PW, PH], [PW - cornerSize, PH], [PW, PH - cornerSize]).fill(GOLD);
        doc.polygon([PW, PH], [PW - cornerSize * 0.6, PH], [PW, PH - cornerSize * 0.6]).fill(BLACK);
        doc.rect(M - 5, M - 5, W + 10, PH - M * 2 + 10).strokeColor(GOLD).lineWidth(1.5).stroke();
        doc.rect(M - 2, M - 2, W + 4, PH - M * 2 + 4).strokeColor(GOLD).lineWidth(0.3).stroke();
        const logoPath = path.join(process.cwd(), 'public', 'images', 'logo.png');
        doc.save();
        doc.opacity(0.06);
        const watermarkW = 280;
        const watermarkH = 280;
        const watermarkX = (PW - watermarkW) / 2;
        const watermarkY = (PH - watermarkH) / 2;
        try {
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, watermarkX, watermarkY, { width: watermarkW, height: watermarkH });
            }
        }
        catch (err) {
            console.error('Failed to draw watermark:', err);
        }
        doc.restore();
        let y = M + 10;
        const logoW = 55;
        const logoH = 55;
        const logoX = (PW - logoW) / 2;
        let hasLogo = false;
        try {
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, logoX, y, { width: logoW, height: logoH });
                hasLogo = true;
            }
        }
        catch (err) {
            console.error('Failed to load logo image:', err);
        }
        if (!hasLogo) {
            const circleX = PW / 2;
            const circleR = 35;
            const centerY = y + logoH / 2;
            doc.circle(circleX, centerY, circleR + 3).fillAndStroke(BLACK, GOLD);
            doc.circle(circleX, centerY, circleR).fillAndStroke(BLACK, GOLD_DARK);
            doc.fontSize(16).fillColor(GOLD).font('Helvetica-Bold')
                .text('S', circleX - 22, centerY - 10, { width: 44, align: 'center' });
        }
        y += logoH + 8;
        doc.fontSize(20).fillColor(BLACK).font('Helvetica-Bold')
            .text(bizName, M, y, { width: W, align: 'center' });
        y += 24;
        doc.fontSize(8.5).fillColor(GOLD_DARK).font('Helvetica')
            .text(`✦  ${getSetting('tagline', COMPANY.tagline)}  ✦`, M, y, { width: W, align: 'center' });
        y += 13;
        doc.fontSize(7.5).fillColor(DARK_GRAY).font('Helvetica')
            .text(`Prop: ${bizProprietor}  |  ${bizPhone}  |  ${getSetting('website', COMPANY.website)}`, M, y, { width: W, align: 'center' });
        y += 10;
        doc.text(bizAddress, M, y, { width: W, align: 'center' });
        y += 10;
        if (bizGstin && bizGstin.trim()) {
            doc.font('Helvetica-Bold').text(`GSTIN: ${bizGstin.trim()}`, M, y, { width: W, align: 'center' });
            y += 10;
        }
        y += 4;
        drawLine(y);
        y += 8;
        const colW = W / 2 - 10;
        doc.fontSize(10).fillColor(BLACK).font('Helvetica-Bold')
            .text(`BILLED TO`, M + 5, y);
        y += 12;
        const customerAddr = order.customer.addresses[0]?.address || '';
        const billedFields = [
            ['Customer Name', order.customer.name],
            ['Organization', ''],
            ['Address', customerAddr],
            ['Contact Person', order.customer.name],
            ['Phone', order.customer.phone],
        ];
        let bY = y;
        for (const [label, value] of billedFields) {
            doc.fontSize(8).fillColor(DARK_GRAY).font('Helvetica')
                .text(label, M + 5, bY, { width: 85 });
            doc.text(':', M + 90, bY);
            const valStr = value || '—';
            doc.fillColor(BLACK).font('Helvetica-Bold');
            const valHeight = doc.heightOfString(valStr, { width: colW - 100 });
            doc.text(valStr, M + 100, bY, { width: colW - 100 });
            const dottedLineY = bY + valHeight + 1;
            drawDottedLine(M + 100, dottedLineY, M + colW);
            bY += Math.max(13.5, valHeight + 4);
        }
        const rightX = M + colW + 20;
        doc.fontSize(10).fillColor(BLACK).font('Helvetica-Bold')
            .text(`${docType} DETAILS`, rightX + 5, y - 12);
        const detailFields = [
            [`${docType === 'INVOICE' ? 'Invoice' : 'Quotation'} No.`, docNumber],
            [docType === 'INVOICE' ? 'Bill Date' : 'Date', new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
            ['Event Date', new Date(order.eventDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
            ['Event Type', order.eventType || '—'],
            ['Venue', order.venue || '—'],
            ['Total Pax', String(order.numberOfPlates)],
        ];
        let dY = y;
        for (const [label, value] of detailFields) {
            doc.fontSize(8).fillColor(DARK_GRAY).font('Helvetica')
                .text(label, rightX + 5, dY, { width: 75 });
            doc.text(':', rightX + 80, dY);
            const valStr = value || '—';
            doc.fillColor(BLACK).font('Helvetica-Bold');
            const valHeight = doc.heightOfString(valStr, { width: colW - 90 });
            doc.text(valStr, rightX + 90, dY, { width: colW - 90 });
            const dottedLineY = dY + valHeight + 1;
            drawDottedLine(rightX + 90, dottedLineY, rightX + colW);
            dY += Math.max(13.5, valHeight + 4);
        }
        y = Math.max(bY, dY) + 8;
        drawLine(y);
        y += 4;
        const tableX = M + 5;
        const tableW = W - 10;
        const cols = [
            { label: 'DESCRIPTION', x: tableX, w: tableW * 0.40, align: 'left' },
            { label: 'QTY / PAX', x: tableX + tableW * 0.40, w: tableW * 0.15, align: 'center' },
            { label: 'RATE PER PERSON', x: tableX + tableW * 0.55, w: tableW * 0.20, align: 'right' },
            { label: 'AMOUNT (Rs.)', x: tableX + tableW * 0.75, w: tableW * 0.25, align: 'right' },
        ];
        const headerH = 16;
        doc.rect(tableX, y, tableW, headerH).fill(TABLE_HEADER_BG);
        for (const col of cols) {
            doc.fontSize(6.5).fillColor(GOLD).font('Helvetica-Bold')
                .text(col.label, col.x + 4, y + 5, { width: col.w - 8, align: col.align });
        }
        y += headerH;
        const displayItems = [];
        if (order.menu) {
            const menuDesc = order.menu.description?.trim();
            const dishNames = order.menu.items.map(mi => mi.name).join(', ');
            let combinedDesc = '';
            if (menuDesc) {
                combinedDesc += menuDesc;
            }
            if (dishNames) {
                if (combinedDesc) {
                    combinedDesc += '\n';
                }
                combinedDesc += `• ${dishNames}`;
            }
            displayItems.push({
                name: `Menu: ${order.menu.name}`,
                description: combinedDesc || undefined,
                qty: order.numberOfPlates,
                rate: order.pricePerPlate,
                amount: order.numberOfPlates * order.pricePerPlate,
            });
        }
        if (order.items.length > 0) {
            for (const oi of order.items) {
                displayItems.push({
                    name: oi.item.name,
                    description: oi.item.description || undefined,
                    qty: oi.quantity,
                    rate: oi.rate,
                    amount: oi.quantity * oi.rate,
                });
            }
        }
        if (displayItems.length === 0) {
            displayItems.push({
                name: order.menu?.name || 'Catering Services',
                qty: order.numberOfPlates,
                rate: order.pricePerPlate,
                amount: order.subtotal,
            });
        }
        const tableRowsStartY = y;
        for (let i = 0; i < displayItems.length; i++) {
            const item = displayItems[i];
            doc.font('Helvetica').fontSize(8);
            const nameHeight = doc.heightOfString(item.name, { width: cols[0].w - 8 });
            doc.fontSize(7);
            const descHeight = item.description ? doc.heightOfString(item.description, { width: cols[0].w - 8 }) : 0;
            const padding = 10;
            const textHeight = nameHeight + (descHeight > 0 ? descHeight + 2 : 0);
            const rowH = Math.max(20, textHeight + padding);
            const bg = i % 2 === 0 ? WHITE : TABLE_ALT_BG;
            doc.rect(tableX, y, tableW, rowH).fill(bg);
            doc.fontSize(8).fillColor(BLACK).font('Helvetica')
                .text(item.name, cols[0].x + 4, y + 5, { width: cols[0].w - 8, align: cols[0].align });
            if (item.description) {
                doc.fontSize(7).fillColor(LIGHT_GRAY).font('Helvetica-Oblique')
                    .text(item.description, cols[0].x + 4, y + 5 + nameHeight + 2, { width: cols[0].w - 8, align: cols[0].align });
            }
            const otherY = y + (rowH - 8) / 2;
            doc.fontSize(8).fillColor(BLACK).font('Helvetica')
                .text(String(item.qty), cols[1].x + 4, otherY, { width: cols[1].w - 8, align: cols[1].align });
            doc.text(`Rs. ${item.rate.toLocaleString('en-IN')}`, cols[2].x + 4, otherY, { width: cols[2].w - 8, align: cols[2].align });
            doc.font('Helvetica-Bold')
                .text(`Rs. ${item.amount.toLocaleString('en-IN')}`, cols[3].x + 4, otherY, { width: cols[3].w - 8, align: cols[3].align });
            y += rowH;
        }
        const tableTotalHeight = y - (tableRowsStartY - headerH);
        doc.rect(tableX, tableRowsStartY - headerH, tableW, tableTotalHeight)
            .strokeColor(GOLD).lineWidth(0.5).stroke();
        y += 6;
        const totalsX = tableX + tableW * 0.55;
        const totalsW = tableW * 0.45;
        const totRowH = 13;
        const deliveryCharges = order.deliveryCharges || 0;
        const discountAmt = (order.subtotal * order.discount) / 100;
        const subtotalAfterDiscount = order.subtotal - discountAmt;
        const gstAmt = (subtotalAfterDiscount * order.gst) / 100;
        const totalsRows = [
            { label: 'SUBTOTAL', value: `Rs. ${order.subtotal.toLocaleString('en-IN')}` },
            { label: 'DELIVERY CHARGES', value: deliveryCharges > 0 ? `Rs. ${deliveryCharges.toLocaleString('en-IN')}` : 'Rs. 0' },
            { label: 'ADDITIONAL CHARGES', value: order.additionalCost > 0 ? `Rs. ${order.additionalCost.toLocaleString('en-IN')}` : 'Rs. 0' },
        ];
        if (order.gst > 0) {
            totalsRows.push({ label: `GST (${order.gst}%)`, value: `Rs. ${gstAmt.toLocaleString('en-IN')}` });
        }
        if (order.discount > 0) {
            totalsRows.push({ label: 'DISCOUNT', value: `- Rs. ${discountAmt.toLocaleString('en-IN')}` });
        }
        totalsRows.push({ label: 'GRAND TOTAL', value: `Rs. ${order.grandTotal.toLocaleString('en-IN')}`, bold: true, gold: true });
        const totalsHeight = totalsRows.length * totRowH;
        doc.rect(totalsX, y, totalsW, totalsHeight).strokeColor(GOLD).lineWidth(0.5).stroke();
        for (let i = 0; i < totalsRows.length; i++) {
            const row = totalsRows[i];
            const ry = y + i * totRowH;
            if (row.gold) {
                doc.rect(totalsX, ry, totalsW, totRowH).fill(GOLD);
                doc.fontSize(8).fillColor(WHITE).font('Helvetica-Bold')
                    .text(row.label, totalsX + 6, ry + 3, { width: totalsW * 0.55 })
                    .text(row.value, totalsX + totalsW * 0.55, ry + 3, { width: totalsW * 0.45 - 6, align: 'right' });
            }
            else {
                if (i > 0) {
                    doc.moveTo(totalsX, ry).lineTo(totalsX + totalsW, ry).strokeColor(GOLD).lineWidth(0.3).stroke();
                }
                const font = row.bold ? 'Helvetica-Bold' : 'Helvetica';
                doc.fontSize(7.5).fillColor(BLACK).font(font)
                    .text(row.label, totalsX + 6, ry + 3, { width: totalsW * 0.55 });
                doc.font('Helvetica-Bold')
                    .text(row.value, totalsX + totalsW * 0.55, ry + 3, { width: totalsW * 0.45 - 6, align: 'right' });
            }
        }
        y += totalsHeight + 10;
        drawLine(y);
        y += 6;
        const bankX = M + 5;
        const bankW = W * 0.55;
        const qrX = M + W * 0.62;
        doc.fontSize(9).fillColor(BLACK).font('Helvetica-Bold')
            .text('BANK PAYMENT DETAILS', bankX, y);
        y += 14;
        const bankFields = [
            ['Account Name', getSetting('bankAccountName', COMPANY.bank.accountName)],
            ['Account Number', getSetting('bankAccountNumber', COMPANY.bank.accountNumber)],
            ['IFSC Code', getSetting('bankIfscCode', COMPANY.bank.ifscCode)],
            ['Branch', getSetting('bankBranch', COMPANY.bank.branch)],
            ['UPI ID', bizUpiId],
        ];
        const bankStartY = y;
        for (const [label, value] of bankFields) {
            doc.fontSize(7.5).fillColor(DARK_GRAY).font('Helvetica-Bold')
                .text(label, bankX + 8, y, { width: 80 });
            doc.fillColor(DARK_GRAY).font('Helvetica').text(`:  ${value}`, bankX + 88, y, { width: bankW - 95 });
            y += 13;
        }
        doc.fontSize(9).fillColor(BLACK).font('Helvetica-Bold')
            .text('SCAN & PAY', qrX, bankStartY - 14, { width: 120, align: 'center' });
        if (qrBuffer) {
            try {
                doc.image(qrBuffer, qrX + 22.5, bankStartY, { width: 75, height: 75 });
            }
            catch {
                doc.fontSize(8).fillColor(LIGHT_GRAY).font('Helvetica')
                    .text('(QR code unavailable)', qrX, bankStartY + 20, { width: 120, align: 'center' });
            }
        }
        y = bankStartY + 85;
        drawLine(y);
        y += 20;
        doc.fontSize(18).fillColor(GOLD_DARK).font('Helvetica-BoldOblique')
            .text('Thank You!', M, y, { width: W, align: 'center' });
        y += 22;
        doc.fontSize(8).fillColor(DARK_GRAY).font('Helvetica-Bold')
            .text('FOR CHOOSING SEISUVAI CATERING', M, y, { width: W, align: 'center' });
        y += 25;
        const termsX = M + 5;
        const sigX = M + W * 0.6;
        const bottomStartY = y;
        doc.fontSize(8).fillColor(BLACK).font('Helvetica-Bold')
            .text('TERMS & CONDITIONS', termsX, bottomStartY);
        let termY = bottomStartY + 14;
        for (const term of COMPANY.terms) {
            doc.fontSize(6.5).fillColor(DARK_GRAY).font('Helvetica')
                .text(`• ${term}`, termsX, termY, { width: W * 0.55 });
            termY += 10;
        }
        doc.fontSize(8).fillColor(GOLD_DARK).font('Helvetica-Bold')
            .text('AUTHORIZED SIGNATURE', sigX, bottomStartY, { width: W * 0.35, align: 'center' });
        drawDottedLine(sigX + 10, bottomStartY + 45, sigX + W * 0.33);
        doc.end();
    }
    async generateInvoicePdf(orderId, res) {
        return this.generatePdf(orderId, res, 'INVOICE');
    }
    async generateQuotationPdf(orderId, res) {
        return this.generatePdf(orderId, res, 'QUOTATION');
    }
};
exports.BillsService = BillsService;
exports.BillsService = BillsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BillsService);
//# sourceMappingURL=bills.service.js.map