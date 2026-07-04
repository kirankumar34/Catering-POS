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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChecklistController = void 0;
const common_1 = require("@nestjs/common");
const checklist_service_1 = require("./checklist.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ChecklistController = class ChecklistController {
    checklistService;
    constructor(checklistService) {
        this.checklistService = checklistService;
    }
    async getTemplates() {
        return this.checklistService.getTemplates();
    }
    async getChecklistForOrder(orderId) {
        return this.checklistService.getChecklistForOrder(orderId);
    }
    async addChecklistItem(orderId, label) {
        return this.checklistService.addChecklistItem(orderId, label);
    }
    async updateChecklistItem(itemId, checked) {
        return this.checklistService.updateChecklistItem(itemId, checked);
    }
    async deleteChecklistItem(itemId) {
        return this.checklistService.deleteChecklistItem(itemId);
    }
    async loadFromTemplate(orderId, templateId) {
        return this.checklistService.loadFromTemplate(orderId, templateId);
    }
};
exports.ChecklistController = ChecklistController;
__decorate([
    (0, common_1.Get)('checklist-templates'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChecklistController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.Get)('orders/:orderId/checklist'),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChecklistController.prototype, "getChecklistForOrder", null);
__decorate([
    (0, common_1.Post)('orders/:orderId/checklist'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)('label')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ChecklistController.prototype, "addChecklistItem", null);
__decorate([
    (0, common_1.Patch)('orders/:orderId/checklist/:itemId'),
    __param(0, (0, common_1.Param)('itemId')),
    __param(1, (0, common_1.Body)('checked')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], ChecklistController.prototype, "updateChecklistItem", null);
__decorate([
    (0, common_1.Delete)('orders/:orderId/checklist/:itemId'),
    __param(0, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChecklistController.prototype, "deleteChecklistItem", null);
__decorate([
    (0, common_1.Post)('orders/:orderId/checklist/from-template/:templateId'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Param)('templateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ChecklistController.prototype, "loadFromTemplate", null);
exports.ChecklistController = ChecklistController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [checklist_service_1.ChecklistService])
], ChecklistController);
//# sourceMappingURL=checklist.controller.js.map