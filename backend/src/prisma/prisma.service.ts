import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    this.logger.log('Connecting to Prisma database...');
    await this.$connect();
    this.logger.log('Connected to database successfully.');
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting from Prisma database...');
    await this.$disconnect();
  }
}
