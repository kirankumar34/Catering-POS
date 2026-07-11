"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const customers_module_1 = require("./customers/customers.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const menu_items_module_1 = require("./menu-items/menu-items.module");
const menus_module_1 = require("./menus/menus.module");
const orders_module_1 = require("./orders/orders.module");
const bills_module_1 = require("./bills/bills.module");
const expenses_module_1 = require("./expenses/expenses.module");
const payments_module_1 = require("./payments/payments.module");
const profit_module_1 = require("./profit/profit.module");
const inventory_module_1 = require("./inventory/inventory.module");
const users_module_1 = require("./users/users.module");
const activity_log_module_1 = require("./activity-log/activity-log.module");
const settings_module_1 = require("./settings/settings.module");
const notifications_module_1 = require("./notifications/notifications.module");
const checklist_module_1 = require("./checklist/checklist.module");
const payment_settings_module_1 = require("./payment-settings/payment-settings.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            customers_module_1.CustomersModule,
            dashboard_module_1.DashboardModule,
            menu_items_module_1.MenuItemsModule,
            menus_module_1.MenusModule,
            orders_module_1.OrdersModule,
            bills_module_1.BillsModule,
            expenses_module_1.ExpensesModule,
            payments_module_1.PaymentsModule,
            profit_module_1.ProfitModule,
            inventory_module_1.InventoryModule,
            users_module_1.UsersModule,
            activity_log_module_1.ActivityLogModule,
            settings_module_1.SettingsModule,
            notifications_module_1.NotificationsModule,
            checklist_module_1.ChecklistModule,
            payment_settings_module_1.PaymentSettingsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map