import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const supabaseSecret = configService.get<string>('SUPABASE_JWT_SECRET');
    const secret = supabaseSecret
      ? (supabaseSecret.endsWith('=') || supabaseSecret.length > 50 ? Buffer.from(supabaseSecret, 'base64') : supabaseSecret)
      : configService.get<string>('JWT_SECRET');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    console.log('--- JWT PAYLOAD ---', payload);
    
    // Supabase JWT payload contains user ID in `sub` and email in `email`
    const supabaseUserId = payload.sub;
    const email = payload.email;

    let user = await this.prisma.user.findUnique({
      where: { id: supabaseUserId },
    });

    // Lazy sync: if the user authenticated via Supabase but doesn't exist in Prisma yet, create them.
    if (!user && email) {
      // Check if user was pre-created by the owner/admin
      const existingUserByEmail = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUserByEmail) {
        // Link the pre-created record to the actual Supabase UID using raw SQL
        // to bypass Prisma Client's restriction on updating primary key fields.
        const firstName = payload.user_metadata?.first_name || existingUserByEmail.firstName || 'New';
        const lastName = payload.user_metadata?.last_name || existingUserByEmail.lastName || 'User';

        await this.prisma.$executeRaw`
          UPDATE "User"
          SET "id" = ${supabaseUserId}, "firstName" = ${firstName}, "lastName" = ${lastName}
          WHERE "email" = ${email}
        `;

        user = await this.prisma.user.findUnique({
          where: { id: supabaseUserId },
        });
      } else {
        user = await this.prisma.user.create({
          data: {
            id: supabaseUserId,
            email: email,
            passwordHash: '', // Not used with Supabase auth
            firstName: payload.user_metadata?.first_name || 'New',
            lastName: payload.user_metadata?.last_name || 'User',
            role: payload.user_metadata?.role || 'CITIZEN',
            isActive: true,
            isVerified: true,
          },
        });

        // Also create appropriate profile based on role
        if (user.role === 'CITIZEN') {
          const household = await this.prisma.household.create({
            data: {
              address: 'Demo Address',
              ward: 'WARD-1',
              city: 'Demo City',
              state: 'Demo State',
              pincode: '000000',
              qrCode: {
                create: {
                  code: user.id
                }
              }
            }
          });
          
          await this.prisma.citizenProfile.create({
            data: {
              userId: user.id,
              householdId: household.id,
              address: 'Demo Address',
              ward: 'WARD-1',
              city: 'Demo City',
              state: 'Demo State',
              pincode: '000000',
            },
          });
        } else if (user.role === 'WORKER') {
          await this.prisma.workerProfile.create({
            data: {
              userId: user.id,
              employeeId: `EMP-${user.id.substring(0, 8).toUpperCase()}`,
              assignedWard: 'WARD-1',
              shift: 'MORNING',
              isAvailable: true,
              totalCollections: 0,
              rating: 5.0,
              rewardPoints: 0,
            }
          });
        } else if (user.role === 'DRIVER') {
          await this.prisma.driverProfile.create({
            data: {
              userId: user.id,
              licenseNumber: `LIC-${user.id.substring(0, 8).toUpperCase()}`,
              isAvailable: true,
              totalTrips: 0,
            }
          });
        } else if (user.role === 'GREEN_CHAMPION') {
          await this.prisma.greenChampionProfile.create({
            data: {
              userId: user.id,
              assignedArea: 'WARD-1',
              verificationCount: 0,
              reportCount: 0,
              rating: 5.0,
            }
          });
        } else if (user.role === 'RECYCLER') {
          await this.prisma.recyclerProfile.create({
            data: {
              userId: user.id,
              businessName: `${user.firstName}'s Recycling`,
              businessAddress: 'Demo Address',
              materialsAccepted: 'PLASTIC, PAPER, METAL',
              totalPickups: 0,
              revenue: 0.0,
            }
          });
        }
      }
    } else if (!user) {
      throw new UnauthorizedException('User is inactive or not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }

    return payload;
  }
}
