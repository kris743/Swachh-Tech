import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CitizensService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.citizenProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { email: true, firstName: true, lastName: true, phone: true } },
        household: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Citizen profile not found');
    }

    return profile;
  }

  async updateProfile(userId: string, data: any) {
    // Only updating profile details, not user details (handled in UsersModule)
    const updatedProfile = await this.prisma.citizenProfile.update({
      where: { userId },
      data,
    });
    return updatedProfile;
  }

  async getDashboard(userId: string) {
    const profile = await this.prisma.citizenProfile.findUnique({
      where: { userId },
      select: { id: true, rewardPoints: true, rewardLevel: true, householdId: true }
    });

    if (!profile) {
      throw new NotFoundException('Citizen profile not found');
    }

    // Get complaints
    const pendingComplaints = await this.prisma.complaint.count({
      where: { citizenId: profile.id, status: { not: 'RESOLVED' } }
    });

    // Get collections if household exists
    let collectionsThisMonth = 0;
    if (profile.householdId) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      collectionsThisMonth = await this.prisma.wasteCollection.count({
        where: {
          householdId: profile.householdId,
          collectedAt: { gte: startOfMonth }
        }
      });
    }

    return {
      stats: {
        rewardPoints: profile.rewardPoints,
        rewardLevel: profile.rewardLevel,
        pendingComplaints,
        collectionsThisMonth,
      }
    };
  }

  async getCollectionHistory(userId: string, page: number = 1, limit: number = 10) {
    const profile = await this.prisma.citizenProfile.findUnique({
      where: { userId },
      select: { householdId: true }
    });

    if (!profile || !profile.householdId) {
      return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
    }

    const skip = (page - 1) * limit;

    const [collections, total] = await Promise.all([
      this.prisma.wasteCollection.findMany({
        where: { householdId: profile.householdId },
        skip,
        take: limit,
        orderBy: { collectedAt: 'desc' },
        include: {
          worker: {
            include: { user: { select: { firstName: true, lastName: true } } }
          }
        }
      }),
      this.prisma.wasteCollection.count({ where: { householdId: profile.householdId } }),
    ]);

    return {
      data: collections,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  async getLeaderboard() {
    const topCitizens = await this.prisma.citizenProfile.findMany({
      take: 50,
      orderBy: { rewardPoints: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, avatar: true } }
      }
    });

    return topCitizens;
  }
}
