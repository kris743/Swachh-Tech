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

      // Also create citizen profile by default if they are citizen
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
            address: '',
            ward: '',
            city: '',
            state: '',
            pincode: '',
          },
        });
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
