import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page: number = 1, limit: number = 10, role?: string) {
    const skip = (page - 1) * limit;
    
    const whereClause = role ? { role: role as any } : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          phone: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where: whereClause }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        citizenProfile: true,
        workerProfile: true,
        driverProfile: true,
        greenChampionProfile: true,
        recyclerProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { passwordHash, refreshToken, ...result } = user;
    return result;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });
      if (emailExists) {
        throw new ConflictException('Email already in use');
      }
    }

    let dataToUpdate: any = { ...updateUserDto };

    if (updateUserDto.password) {
      dataToUpdate.passwordHash = await bcrypt.hash(updateUserDto.password, 12);
      delete dataToUpdate.password;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    const { passwordHash, refreshToken, ...result } = updatedUser;
    return result;
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Soft delete
    await this.prisma.user.update({
      where: { id: id },
      data: { isActive: false },
    });

    return { deleted: true };
  }

  async assignRole(emailOrId: string, role: string) {
    const isEmail = emailOrId.includes('@');
    let user = null;

    if (isEmail) {
      user = await this.prisma.user.findUnique({
        where: { email: emailOrId.trim().toLowerCase() },
      });
    } else {
      user = await this.prisma.user.findUnique({
        where: { id: emailOrId.trim() },
      });
    }

    if (user) {
      // Update role for existing user
      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: { role },
      });
      const { passwordHash, refreshToken, ...result } = updatedUser;
      return result;
    } else {
      if (isEmail) {
        // Pre-create the user record with placeholders
        const newUser = await this.prisma.user.create({
          data: {
            id: randomUUID(),
            email: emailOrId.trim().toLowerCase(),
            firstName: 'Pre-assigned',
            lastName: 'User',
            passwordHash: '',
            role,
            isActive: true,
            isVerified: true,
          },
        });
        const { passwordHash, refreshToken, ...result } = newUser;
        return result;
      } else {
        throw new NotFoundException(
          `User with ID ${emailOrId} not found in database. To pre-assign roles, please use their Email address.`,
        );
      }
    }
  }
}
