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
    });

    if (!dbUser && user.email) {
      dbUser = await this.prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          passwordHash: '',
          firstName: user.user_metadata?.first_name || 'New',
          lastName: user.user_metadata?.last_name || 'User',
          role: user.user_metadata?.role || 'CITIZEN',
          isActive: true,
          isVerified: true,
        },
      });

      if (dbUser.role === 'CITIZEN') {
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
            address: '',
            ward: '',
            city: '',
            state: '',
            pincode: '',
          },
        });
      }
    } else if (!dbUser || !dbUser.isActive) {
      throw new UnauthorizedException('User is inactive or not found');
    }

    request.user = { sub: dbUser.id, email: dbUser.email, role: dbUser.role };
    return true;
  }
}
