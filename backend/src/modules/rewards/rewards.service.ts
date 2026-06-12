import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EarnRewardDto } from './dto/earn-reward.dto';
import { RewardLevel } from '../../common/prisma-enums';;

@Injectable()
export class RewardsService {
  constructor(private readonly prisma: PrismaService) {}

  async getWallet(userId: string) {
    const profile = await this.prisma.citizenProfile.findUnique({
      where: { userId },
      select: { rewardPoints: true, rewardLevel: true }
    });

    if (!profile) throw new NotFoundException('Citizen profile not found');

    const nextLevelThreshold = this.getNextLevelThreshold(profile.rewardLevel);
    const progress = Math.min(100, (profile.rewardPoints / nextLevelThreshold) * 100);

    return {
      points: profile.rewardPoints,
      level: profile.rewardLevel,
      nextLevelThreshold,
      progress
    };
  }

  async getLeaderboard() {
    const topCitizens = await this.prisma.citizenProfile.findMany({
      take: 50,
      orderBy: { rewardPoints: 'desc' },
      select: {
        id: true,
        rewardPoints: true,
        rewardLevel: true,
        user: { select: { firstName: true, lastName: true, avatar: true } }
      }
    });

    return topCitizens;
  }

  async getTransactions(userId: string, page: number = 1, limit: number = 10) {
    const profile = await this.prisma.citizenProfile.findUnique({
      where: { userId }
    });

    if (!profile) throw new NotFoundException('Citizen profile not found');

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.prisma.rewardTransaction.findMany({
        where: { citizenId: profile.id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.rewardTransaction.count({ where: { citizenId: profile.id } })
    ]);

    return {
      data: transactions,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  // Used internally by other modules
  async earnPoints(citizenId: string, dto: EarnRewardDto) {
    const profile = await this.prisma.citizenProfile.findUnique({
      where: { id: citizenId }
    });

    if (!profile) throw new NotFoundException('Citizen profile not found');

    const newTotalPoints = profile.rewardPoints + dto.points;
    const newLevel = this.calculateLevel(newTotalPoints);

    const [transaction] = await this.prisma.$transaction([
      this.prisma.rewardTransaction.create({
        data: {
          citizenId,
          action: dto.action,
          points: dto.points,
          description: dto.description
        }
      }),
      this.prisma.citizenProfile.update({
        where: { id: citizenId },
        data: { 
          rewardPoints: newTotalPoints,
          rewardLevel: newLevel
        }
      })
    ]);

    return transaction;
  }

  private calculateLevel(points: number): RewardLevel {
    if (points >= 5000) return RewardLevel.PLATINUM;
    if (points >= 2000) return RewardLevel.GOLD;
    if (points >= 500) return RewardLevel.SILVER;
    return RewardLevel.BRONZE;
  }

  private getNextLevelThreshold(currentLevel: RewardLevel): number {
    switch (currentLevel) {
      case RewardLevel.BRONZE: return 500;
      case RewardLevel.SILVER: return 2000;
      case RewardLevel.GOLD: return 5000;
      case RewardLevel.PLATINUM: return 10000; // Cap or infinite
      default: return 500;
    }
  }
}
