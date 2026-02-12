import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client: PrismaClient;
  private readonly pool: pg.Pool;

  constructor() {
    this.pool = new pg.Pool({ connectionString: process.env['DATABASE_URL'] });
    const adapter = new PrismaPg(this.pool);
    this.client = new (PrismaClient as unknown as new (opts: { adapter: unknown }) => PrismaClient)({
      adapter,
    });
  }

  get db(): PrismaClient {
    return this.client;
  }

  async onModuleInit() {
    await (this.client as unknown as { $connect(): Promise<void> }).$connect();
  }

  async onModuleDestroy() {
    await (this.client as unknown as { $disconnect(): Promise<void> }).$disconnect();
    await this.pool.end();
  }
}
