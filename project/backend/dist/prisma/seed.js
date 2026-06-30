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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_better_sqlite3_1 = require("@prisma/adapter-better-sqlite3");
const bcrypt = __importStar(require("bcrypt"));
const path = __importStar(require("node:path"));
const dbPath = path.resolve(__dirname, 'dev.db');
const adapter = new adapter_better_sqlite3_1.PrismaBetterSqlite3({ url: dbPath });
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('Seeding database...');
    const superAdminRole = await prisma.role.upsert({
        where: { name: 'SUPER_ADMIN' },
        update: { description: 'Overall system administrator with full access' },
        create: { name: 'SUPER_ADMIN', description: 'Overall system administrator with full access' },
    });
    console.log(`Upserted role: ${superAdminRole.name}`);
    const ownerRole = await prisma.role.upsert({
        where: { name: 'OWNER' },
        update: { description: 'Business owner with access to financials and settings' },
        create: { name: 'OWNER', description: 'Business owner with access to financials and settings' },
    });
    console.log(`Upserted role: ${ownerRole.name}`);
    const staffRole = await prisma.role.upsert({
        where: { name: 'STAFF' },
        update: { description: 'Front-desk or billing staff with limited permissions' },
        create: { name: 'STAFF', description: 'Front-desk or billing staff with limited permissions' },
    });
    console.log(`Upserted role: ${staffRole.name}`);
    const passwordHashAdmin = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            email: 'admin@seisuvai.com',
            passwordHash: passwordHashAdmin,
            roleId: superAdminRole.id,
        },
    });
    console.log(`Upserted super admin user: ${adminUser.username}`);
    const passwordHashOwner = await bcrypt.hash('owner123', 10);
    const ownerUser = await prisma.user.upsert({
        where: { username: 'owner' },
        update: {},
        create: {
            username: 'owner',
            email: 'owner@seisuvai.com',
            passwordHash: passwordHashOwner,
            roleId: ownerRole.id,
        },
    });
    console.log(`Upserted owner user: ${ownerUser.username}`);
    const passwordHashStaff = await bcrypt.hash('staff123', 10);
    const staffUser = await prisma.user.upsert({
        where: { username: 'staff' },
        update: {},
        create: {
            username: 'staff',
            email: 'staff@seisuvai.com',
            passwordHash: passwordHashStaff,
            roleId: staffRole.id,
        },
    });
    console.log(`Upserted staff user: ${staffUser.username}`);
    console.log('Seeding completed successfully!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map