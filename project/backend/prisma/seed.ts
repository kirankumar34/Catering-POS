import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

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
  if (process.env.NODE_ENV === 'production') {
    console.log('Skipping default demo user seeding in production.');
  } else {
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
  }

  // 3. Seed default checklist templates
  const templateCount = await prisma.checklistTemplate.count();
  if (templateCount === 0) {
    console.log('Seeding checklist templates...');
    const standardPrep = await prisma.checklistTemplate.create({
      data: {
        name: 'Standard Event Prep',
        items: {
          create: [
            { label: 'Verify advance payment collected', orderIndex: 0 },
            { label: 'Confirm final menu and pax count', orderIndex: 1 },
            { label: 'Procure ingredients and raw materials', orderIndex: 2 },
            { label: 'Assign service and cooking staff', orderIndex: 3 },
            { label: 'Pack catering equipment & utensils', orderIndex: 4 },
            { label: 'Arrange transportation to venue', orderIndex: 5 },
            { label: 'Setup food counters and warmers', orderIndex: 6 },
            { label: 'Verify food quality and taste before service', orderIndex: 7 },
            { label: 'Collect feedback and final payment', orderIndex: 8 },
          ],
        },
      },
    });
    console.log(`Upserted checklist template: ${standardPrep.name}`);

    const vipPrep = await prisma.checklistTemplate.create({
      data: {
        name: 'VVIP Premium Event Prep',
        items: {
          create: [
            { label: 'Confirm VIP menu custom preferences', orderIndex: 0 },
            { label: 'Arrange premium table linens & chinaware', orderIndex: 1 },
            { label: 'Schedule pre-service tasting session', orderIndex: 2 },
            { label: 'Appoint senior hospitality supervisors', orderIndex: 3 },
            { label: 'Deploy dedicated live counters', orderIndex: 4 },
            { label: 'Organize high-grade dessert presentation', orderIndex: 5 },
          ],
        },
      },
    });
    console.log(`Upserted checklist template: ${vipPrep.name}`);
  }

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
