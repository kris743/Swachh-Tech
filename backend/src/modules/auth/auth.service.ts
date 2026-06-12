import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 12);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: registerDto.email,
          passwordHash,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          phone: registerDto.phone,
          role: registerDto.role,
        },
      });

      // Initialize appropriate profile based on role
      switch (registerDto.role) {
        case 'CITIZEN':
          const household = await this.prisma.household.create({
            data: {
              address: 'Demo Address',
              ward: 'WARD-1',
              city: 'Demo City',
              state: 'Demo State',
              pincode: '000000',
              qrCode: {
                create: {
                  code: user.id // The frontend copies user.id as the scan code!
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
          break;
        case 'WORKER':
          await this.prisma.workerProfile.create({
            data: {
              userId: user.id,
              employeeId: `EMP-${Math.floor(Math.random() * 10000)}`,
              assignedWard: 'WARD-1',
              shift: 'MORNING'
            }
          });
          break;
      }

      const tokens = await this.generateTokens(user.id, user.email, user.role);
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      const { passwordHash: _, refreshToken: __, ...userWithoutSensitiveData } = user;
      
      return {
        user: userWithoutSensitiveData,
        ...tokens,
      };
    } catch (error) {
      throw new InternalServerErrorException('Registration failed');
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const { passwordHash, refreshToken, ...userWithoutSensitiveData } = user;
    
    return {
      user: userWithoutSensitiveData,
      ...tokens,
    };
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { loggedOut: true };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        citizenProfile: true,
        workerProfile: true,
        driverProfile: true,
        greenChampionProfile: true,
        recyclerProfile: true,
      }
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const { passwordHash, refreshToken, ...userWithoutSensitiveData } = user;
    return userWithoutSensitiveData;
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload: JwtPayload = { sub: userId, email, role: role as any };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRATION', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
  }
}
