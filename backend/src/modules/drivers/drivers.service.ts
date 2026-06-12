import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateLocationDto } from './dto/update-location.dto';
import { TruckStatus } from '../../common/prisma-enums';;

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [drivers, total] = await Promise.all([
      this.prisma.driverProfile.findMany({
        skip,
        take: limit,
        include: {
          user: { select: { firstName: true, lastName: true, phone: true, email: true, isActive: true } },
          assignedTruck: { select: { registrationNumber: true, capacity: true } }
        }
      }),
      this.prisma.driverProfile.count(),
    ]);

    return {
      data: drivers,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const driver = await this.prisma.driverProfile.findUnique({
      where: { id },
      include: {
        user: { select: { firstName: true, lastName: true, phone: true, email: true, isActive: true } },
        assignedTruck: true,
        routeAssignments: { take: 5, orderBy: { createdAt: 'desc' }, include: { route: true } }
      }
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    return driver;
  }

  async getMyRoute(userId: string) {
    const profile = await this.prisma.driverProfile.findUnique({
      where: { userId },
    });

    if (!profile) throw new NotFoundException('Driver profile not found');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const assignment = await this.prisma.routeAssignment.findFirst({
      where: { 
        driverId: profile.id,
        date: today
      },
      include: {
        route: true,
        truck: true
      }
    });

    return assignment || null;
  }

  async updateLocation(userId: string, dto: UpdateLocationDto) {
    const profile = await this.prisma.driverProfile.findUnique({
      where: { userId },
    });

    if (!profile || !profile.assignedTruckId) {
      throw new NotFoundException('Driver or assigned truck not found');
    }

    // Update truck location
    await this.prisma.truck.update({
      where: { id: profile.assignedTruckId },
      data: {
        currentLatitude: dto.latitude,
        currentLongitude: dto.longitude,
        status: TruckStatus.EN_ROUTE
      }
    });

    // In a real implementation, we would also emit this to a websocket gateway for live tracking
    // The TrackingGateway will be responsible for that

    return { success: true, updated: new Date() };
  }

  async getDailySummary(userId: string) {
    const profile = await this.prisma.driverProfile.findUnique({
      where: { userId },
    });

    if (!profile) throw new NotFoundException('Driver profile not found');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const assignment = await this.prisma.routeAssignment.findFirst({
      where: { 
        driverId: profile.id,
        date: today
      },
      include: { route: true }
    });

    return {
      totalTrips: profile.totalTrips,
      todayAssignment: assignment ? {
        status: assignment.status,
        distance: assignment.route.distance,
        collectionsCount: assignment.collectionsCount,
        fuelUsed: assignment.fuelUsed
      } : null
    };
  }
}
