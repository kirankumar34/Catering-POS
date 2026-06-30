import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as bcrypt from 'bcrypt';
import * as path from 'node:path';

const dbPath = path.resolve(__dirname, 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // 1. Seed Roles
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

  // 2. Seed default users
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
