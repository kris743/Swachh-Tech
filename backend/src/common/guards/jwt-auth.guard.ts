import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard {
  private supabase;

  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL') || process.env.SUPABASE_URL || '',
      this.configService.get<string>('SUPABASE_ANON_KEY') || process.env.SUPABASE_ANON_KEY || ''
    );
  }

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await this.supabase.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException('Invalid token');
    }

    // Lazy sync to Prisma
    let dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        citizenProfile: true,
        workerProfile: true,
        driverProfile: true,
        recyclerProfile: true,
        greenChampionProfile: true,
      }
    });

    if (!dbUser && user.email) {
      // Check if user was pre-created by the owner/admin
      const existingUserByEmail = await this.prisma.user.findUnique({
        where: { email: user.email },
      });

      if (existingUserByEmail) {
        // Link the pre-created record to the actual Supabase UID using raw SQL
        // to bypass Prisma Client's restriction on updating primary key fields.
        const firstName = user.user_metadata?.first_name || existingUserByEmail.firstName || 'New';
        const lastName = user.user_metadata?.last_name || existingUserByEmail.lastName || 'User';
        
        await this.prisma.$executeRaw`
          UPDATE "User"
          SET "id" = ${user.id}, "firstName" = ${firstName}, "lastName" = ${lastName}
          WHERE "email" = ${user.email}
        `;

        dbUser = await this.prisma.user.findUnique({
          where: { id: user.id },
          include: {
            citizenProfile: true,
            workerProfile: true,
            driverProfile: true,
            recyclerProfile: true,
            greenChampionProfile: true,
          }
        });
      } else {
        dbUser = await this.prisma.user.create({
          data: {
            id: user.id,
            email: user.email,
            passwordHash: '',
            firstName: user.user_metadata?.first_name || 'New',
            lastName: user.user_metadata?.last_name || 'User',
            role: user.user_metadata?.role || 'CITIZEN', // Synchronize role from Supabase metadata
            isActive: true,
            isVerified: true,
          },
          include: {
            citizenProfile: true,
            workerProfile: true,
            driverProfile: true,
            recyclerProfile: true,
            greenChampionProfile: true,
          }
        });
      }
    } else if (!dbUser || !dbUser.isActive) {
      throw new UnauthorizedException('User is inactive or not found');
    }

    // Now verify the profile exists based on user role, and lazily create it if it doesn't exist
    if (dbUser) {
      const role = dbUser.role;
      if (role === 'CITIZEN' && !dbUser.citizenProfile) {
        const household = await this.prisma.household.create({
          data: {
            address: 'Demo Address',
            ward: 'WARD-1',
            city: 'Demo City',
            state: 'Demo State',
            pincode: '000000',
            qrCode: {
              create: {
                code: dbUser.id
              }
            }
          }
        });
        
        await this.prisma.citizenProfile.create({
          data: {
            userId: dbUser.id,
            householdId: household.id,
            address: 'Demo Address',
            ward: 'WARD-1',
            city: 'Demo City',
            state: 'Demo State',
            pincode: '000000',
          },
        });
      } else if (role === 'WORKER' && !dbUser.workerProfile) {
        await this.prisma.workerProfile.create({
          data: {
            userId: dbUser.id,
            employeeId: `EMP-${dbUser.id.substring(0, 8).toUpperCase()}`,
            assignedWard: 'WARD-1',
            shift: 'MORNING',
            isAvailable: true,
            totalCollections: 0,
            rating: 5.0,
            rewardPoints: 0,
          }
        });
      } else if (role === 'DRIVER' && !dbUser.driverProfile) {
        await this.prisma.driverProfile.create({
          data: {
            userId: dbUser.id,
            licenseNumber: `LIC-${dbUser.id.substring(0, 8).toUpperCase()}`,
            isAvailable: true,
            totalTrips: 0,
          }
        });
      } else if (role === 'GREEN_CHAMPION' && !dbUser.greenChampionProfile) {
        await this.prisma.greenChampionProfile.create({
          data: {
            userId: dbUser.id,
            assignedArea: 'WARD-1',
            verificationCount: 0,
            reportCount: 0,
            rating: 5.0,
          }
        });
      } else if (role === 'RECYCLER' && !dbUser.recyclerProfile) {
        await this.prisma.recyclerProfile.create({
          data: {
            userId: dbUser.id,
            businessName: `${dbUser.firstName}'s Recycling`,
            businessAddress: 'Demo Address',
            materialsAccepted: 'PLASTIC, PAPER, METAL',
            totalPickups: 0,
            revenue: 0.0,
          }
        });
      }
    }

    request.user = { sub: dbUser.id, email: dbUser.email, role: dbUser.role };
    return true;
  }
}
