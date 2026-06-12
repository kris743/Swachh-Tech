import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CollectionStatus } from '../../common/prisma-enums';
import { WasteType } from '../../common/prisma-enums';;

@Injectable()
export class CollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page: number = 1, limit: number = 10, ward?: string, status?: CollectionStatus) {
    const skip = (page - 1) * limit;
    
    let where: any = {};
    if (ward) where.household = { ward };
    if (status) where.status = status;

    const [collections, total] = await Promise.all([
      this.prisma.wasteCollection.findMany({
        where,
        skip,
        take: limit,
        orderBy: { collectedAt: 'desc' },
        include: {
          household: true,
          worker: { include: { user: { select: { firstName: true, lastName: true } } } },
        }
      }),
      this.prisma.wasteCollection.count({ where }),
    ]);

    return {
      data: collections,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const collection = await this.prisma.wasteCollection.findUnique({
      where: { id },
      include: {
        household: true,
        worker: { include: { user: { select: { firstName: true, lastName: true } } } },
        qrCode: true
      }
    });

    if (!collection) throw new NotFoundException('Collection not found');
    return collection;
  }

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalToday, totalWeightToday, byType] = await Promise.all([
      this.prisma.wasteCollection.count({
        where: { collectedAt: { gte: today } }
      }),
      this.prisma.wasteCollection.aggregate({
        where: { collectedAt: { gte: today } },
        _sum: { weight: true }
      }),
      this.prisma.wasteCollection.groupBy({
        by: ['wasteType'],
        where: { collectedAt: { gte: today } },
        _count: { _all: true }
      })
    ]);

    return {
      totalToday,
      totalWeightToday: totalWeightToday._sum.weight || 0,
      byType: byType.map(b => ({ type: b.wasteType, count: b._count._all }))
    };
  }

  async getByWard(ward: string, page: number = 1, limit: number = 10) {
    return this.findAll(page, limit, ward);
  }
}
