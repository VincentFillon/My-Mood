import { PrismaClient } from '../generated/prisma/client.js';

const prisma = new PrismaClient({});

async function main() {
  // Seed data will be added here as models are created
  console.log('Seeding database...');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
