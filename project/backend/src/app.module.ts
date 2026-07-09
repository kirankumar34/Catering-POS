import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MenuItemsModule } from './menu-items/menu-items.module';
import { MenusModule } from './menus/menus.module';
import { OrdersModule } from './orders/orders.module';
import { BillsModule } from './bills/bills.module';
import { ExpensesModule } from './expenses/expenses.module';
import { PaymentsModule } from './payments/payments.module';
import { ProfitModule } from './profit/profit.module';
import { InventoryModule } from './inventory/inventory.module';
import { UsersModule } from './users/users.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { SettingsModule } from './settings/settings.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ChecklistModule } from './checklist/checklist.module';
import { PaymentSettingsModule } from './payment-settings/payment-settings.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    CustomersModule,
    DashboardModule,
    MenuItemsModule,
    MenusModule,
    OrdersModule,
    BillsModule,
    ExpensesModule,
    PaymentsModule,
    ProfitModule,
    InventoryModule,
    UsersModule,
    ActivityLogModule,
    SettingsModule,
    NotificationsModule,
    ChecklistModule,
    PaymentSettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
