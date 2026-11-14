import { PrismaClient } from '@prisma/client';

/**
 * Singleton PrismaClient instance.
 */
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error'],
  });
} else {
  if (!globalThis.__prisma) {
    globalThis.__prisma = new PrismaClient({
      log: ['info', 'warn', 'error'],
    });
  }
  prisma = globalThis.__prisma;
}

// Graceful connection handling
prisma.$connect()
  .then(() => {
    console.log('✅ Connected to database');
  })
  .catch((error) => {
    console.warn('⚠️ Database connection warning:', error.message);
  });

// Graceful shutdown on process termination
const gracefulShutdown = async (signal) => {
  console.log(`\n🔌 Received ${signal}. Disconnecting Prisma…`);
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

export default prisma;
