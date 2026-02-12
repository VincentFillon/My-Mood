import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env['DATABASE_URL'] });
const adapter = new PrismaPg(pool);
const prisma = new (PrismaClient as unknown as new (opts: { adapter: unknown }) => PrismaClient)({
  adapter,
});

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
    await (prisma as unknown as { $disconnect(): Promise<void> }).$disconnect();
    await pool.end();
  });
