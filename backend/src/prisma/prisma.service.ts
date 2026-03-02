import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { appContext } from '../common/context/app.context.js';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client: PrismaClient;
  private readonly pool: pg.Pool;
  private readonly extendedClient: ReturnType<typeof this.createExtendedClient>;

  constructor() {
    this.pool = new pg.Pool({ connectionString: process.env['DATABASE_URL'] });
    const adapter = new PrismaPg(this.pool);
    this.client = new (PrismaClient as unknown as new (opts: {
      adapter: unknown;
    }) => PrismaClient)({
      adapter,
    });
    this.extendedClient = this.createExtendedClient();
  }

  private createExtendedClient() {
    const prisma = this.client;
    return prisma.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            const ctx = appContext.getStore();
            const groupId = ctx?.groupId || '';
            const [, result] = await prisma.$transaction([
              prisma.$executeRaw`SELECT set_config('app.current_group_id', ${groupId}, true)`,
              query(args),
            ]);
            return result;
          },
        },
      },
    });
  }

  get db() {
    return this.extendedClient;
  }

  async onModuleInit() {
    await (this.client as unknown as { $connect(): Promise<void> }).$connect();
  }

  async onModuleDestroy() {
    await (
      this.client as unknown as { $disconnect(): Promise<void> }
    ).$disconnect();
    await this.pool.end();
  }
}
