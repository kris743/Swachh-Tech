import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CitizensModule } from './modules/citizens/citizens.module';
import { WorkersModule } from './modules/workers/workers.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { QrCodesModule } from './modules/qr-codes/qr-codes.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { ComplaintsModule } from './modules/complaints/complaints.module';
import { RewardsModule } from './modules/rewards/rewards.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { FeedbackModule } from './modules/feedback/feedback.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env', // Point to root .env
    }),
    
    // Rate Limiting
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),

    // Database
    PrismaModule,

    // Feature Modules
    AuthModule,
    UsersModule,
    CitizensModule,
    WorkersModule,
    DriversModule,
    QrCodesModule,
    CollectionsModule,
    ComplaintsModule,
    RewardsModule,
    AnalyticsModule,
    FeedbackModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
