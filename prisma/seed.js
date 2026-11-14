import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting QueueLess database seed...');

  const passwordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  // 1. Seed Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@queueless.com' },
    update: {},
    create: {
      name: 'Platform Administrator',
      email: 'admin@queueless.com',
      phone: '+1-555-0100',
      passwordHash: adminPasswordHash,
      role: 'PLATFORM_ADMIN',
    },
  });

  const businessAdmin = await prisma.user.upsert({
    where: { email: 'business@example.com' },
    update: {},
    create: {
      name: 'Dr. Sarah Smith',
      email: 'business@example.com',
      phone: '+1-555-0101',
      passwordHash,
      role: 'BUSINESS_ADMIN',
    },
  });

  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@example.com' },
    update: {},
    create: {
      name: 'Nurse John Doe',
      email: 'staff@example.com',
      phone: '+1-555-0102',
      passwordHash,
      role: 'STAFF',
    },
  });

  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      name: 'Alex Johnson',
      email: 'customer@example.com',
      phone: '+1-555-0103',
      passwordHash,
      role: 'CUSTOMER',
    },
  });

  console.log('👥 Users seeded:');
  console.log('   - Platform Admin: admin@queueless.com (pwd: admin123)');
  console.log('   - Business Admin: business@example.com (pwd: password123)');
  console.log('   - Staff: staff@example.com (pwd: password123)');
  console.log('   - Customer: customer@example.com (pwd: password123)');

  // 2. Seed Business
  let business = await prisma.business.findFirst({
    where: { ownerId: businessAdmin.id },
  });

  if (!business) {
    business = await prisma.business.create({
      data: {
        name: 'Quick Clinic & Urgent Care',
        category: 'Healthcare',
        address: '123 Medical Center Blvd, Suite 400',
        ownerId: businessAdmin.id,
      },
    });
  }

  // 3. Link Staff to Business
  await prisma.staff.upsert({
    where: { userId: staffUser.id },
    update: { businessId: business.id },
    create: {
      userId: staffUser.id,
      businessId: business.id,
    },
  });

  // 4. Seed Queues
  let generalQueue = await prisma.queue.findFirst({
    where: { businessId: business.id, name: 'General Consultation' },
  });

  if (!generalQueue) {
    generalQueue = await prisma.queue.create({
      data: {
        businessId: business.id,
        name: 'General Consultation',
        description: 'Walk-in doctor consultations and triage',
        averageServiceTime: 10,
        maxCapacity: 50,
        status: 'ACTIVE',
        currentToken: 3,
      },
    });
  }

  let labQueue = await prisma.queue.findFirst({
    where: { businessId: business.id, name: 'Lab Tests & Bloodwork' },
  });

  if (!labQueue) {
    labQueue = await prisma.queue.create({
      data: {
        businessId: business.id,
        name: 'Lab Tests & Bloodwork',
        description: 'Routine phlebotomy, blood tests, and sample drops',
        averageServiceTime: 5,
        maxCapacity: 30,
        status: 'ACTIVE',
        currentToken: 0,
      },
    });
  }

  // 5. Seed Sample Queue Entries
  const existingEntries = await prisma.queueEntry.count({
    where: { queueId: generalQueue.id },
  });

  if (existingEntries === 0) {
    await prisma.queueEntry.createMany({
      data: [
        {
          queueId: generalQueue.id,
          customerId: customerUser.id,
          customerName: customerUser.name,
          customerPhone: customerUser.phone,
          tokenNumber: 1,
          status: 'CALLED',
          calledAt: new Date(),
        },
        {
          queueId: generalQueue.id,
          customerName: 'Michael Brown',
          customerPhone: '+1-555-0104',
          tokenNumber: 2,
          status: 'WAITING',
          joinedAt: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
        },
        {
          queueId: generalQueue.id,
          customerName: 'Emily Davis',
          customerPhone: '+1-555-0105',
          tokenNumber: 3,
          status: 'WAITING',
          joinedAt: new Date(Date.now() - 5 * 60 * 1000), // 5 mins ago
        },
      ],
    });
  }

  console.log('🏥 Business and Queues seeded:');
  console.log(`   - Business: ${business.name} (ID: ${business.id})`);
  console.log(`   - Queue 1: ${generalQueue.name} (ID: ${generalQueue.id})`);
  console.log(`   - Queue 2: ${labQueue.name} (ID: ${labQueue.id})`);
  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

