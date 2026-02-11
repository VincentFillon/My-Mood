import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client.js';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client: PrismaClient;

  constructor() {
    this.client = new (PrismaClient as new (...args: unknown[]) => PrismaClient)();
  }

  get db(): PrismaClient {
    return this.client;
  }

  async onModuleInit() {
    await (this.client as unknown as { $connect(): Promise<void> }).$connect();
  }

  async onModuleDestroy() {
    await (this.client as unknown as { $disconnect(): Promise<void> }).$disconnect();
  }
}
