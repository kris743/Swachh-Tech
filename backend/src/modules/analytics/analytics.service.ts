import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalWaste,
      activeComplaints,
      activeTrucks,
      topCitizens
    ] = await Promise.all([
      this.prisma.wasteCollection.aggregate({
        _sum: { weight: true }
      }),
      this.prisma.complaint.count({
        where: { status: { notIn: ['RESOLVED', 'REJECTED'] } }
      }),
      this.prisma.truck.count({
        where: { status: 'ACTIVE' }
      }),
      this.prisma.citizenProfile.findMany({
        take: 5,
        orderBy: { rewardPoints: 'desc' },
        include: { user: { select: { firstName: true, lastName: true } } }
      })
    ]);

    // Format top citizens
    const formattedTopCitizens = topCitizens.map(c => ({
      name: `${c.user.firstName} ${c.user.lastName}`,
      points: c.rewardPoints,
      level: c.rewardLevel
    }));

    return {
      kpi: {
        totalWasteCollectedKg: totalWaste._sum.weight || 0,
        activeComplaints,
        activeTrucks,
        recyclingRate: 42.5, // Mock value, in real scenario calculate from Recycler data
      },
      topCitizens: formattedTopCitizens
    };
  }

  async getWasteTrends() {
    // Get last 7 days of snapshots
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const snapshots = await this.prisma.analyticsSnapshot.findMany({
      where: { date: { gte: sevenDaysAgo } },
      orderBy: { date: 'asc' }
    });

    // Group by date
    const trendsByDate = snapshots.reduce((acc, curr) => {
      const dateStr = curr.date.toISOString().split('T')[0];
      if (!acc[dateStr]) acc[dateStr] = 0;
      acc[dateStr] += curr.wasteCollected;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(trendsByDate).map(([date, weight]) => ({ date, weight }));
  }

  async getComplaintStats() {
    const stats = await this.prisma.complaint.groupBy({
      by: ['type'],
      _count: { _all: true }
    });

    return stats.map(s => ({
      type: s.type,
      count: s._count._all
    }));
  }

  async getWardAnalytics(ward: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const snapshots = await this.prisma.analyticsSnapshot.findMany({
      where: { 
        ward,
        date: { gte: thirtyDaysAgo }
      },
      orderBy: { date: 'asc' }
    });

    return snapshots;
  }
}
