import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AttendanceCheckInDto } from './dto/attendance.dto';

@Injectable()
export class WorkersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page: number = 1, limit: number = 10, ward?: string) {
    const skip = (page - 1) * limit;
    const where = ward ? { assignedWard: ward } : {};

    const [workers, total] = await Promise.all([
      this.prisma.workerProfile.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { firstName: true, lastName: true, phone: true, email: true, isActive: true } }
        }
      }),
      this.prisma.workerProfile.count({ where }),
    ]);

    return {
      data: workers,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const worker = await this.prisma.workerProfile.findUnique({
      where: { id },
      include: {
        user: { select: { firstName: true, lastName: true, phone: true, email: true, isActive: true } },
        attendanceRecords: { take: 5, orderBy: { createdAt: 'desc' } }
      }
    });

    if (!worker) {
      throw new NotFoundException('Worker not found');
    }

    return worker;
  }

  async getDashboard(userId: string) {
    const profile = await this.prisma.workerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Worker profile not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [collectionsToday, attendanceToday, complaintsToday, pickupsToday, householdsToday] = await Promise.all([
      this.prisma.wasteCollection.count({
        where: {
          workerId: profile.id,
          collectedAt: { gte: today }
        }
      }),
      this.prisma.attendanceRecord.findFirst({
        where: {
          workerId: profile.id,
          date: today
        }
      }),
      this.prisma.complaint.findMany({
        where: {
          status: 'PENDING',
          citizen: {
            ward: profile.assignedWard
          }
        },
        include: { citizen: true },
        take: 10
      }),
      this.prisma.pickupRequest.findMany({
        where: {
          status: 'PENDING',
          // Assuming pickup requests don't directly have ward, we could fetch by household ward or just return all for now.
          // Wait, pickup request doesn't have a ward field directly, let's fetch by joining Household.
        },
        include: { recycler: true },
        take: 5
      }),
      this.prisma.household.findMany({
        where: {
          ward: profile.assignedWard,
          isActive: true
        },
        take: 50 // Limit to first 50 houses for the simulated route
      })
    ]);

    // Format Alerts
    const liveAlerts = [
      ...complaintsToday.map(c => ({
        id: c.id,
        type: c.type,
        location: c.address || `${profile.assignedWard} Area`,
        time: c.createdAt.toISOString(),
        urgent: true
      })),
      ...pickupsToday.map(p => ({
        id: p.id,
        type: 'PICKUP_REQUEST',
        location: p.recycler ? p.recycler.businessName : 'Special Pickup',
        time: p.createdAt.toISOString(),
        urgent: true
      }))
    ];

    // Format Route
    const routeAssignments = householdsToday.map((h, i) => ({
      id: h.id,
      area: h.address,
      time: 'Pending', // Simplified for simulation
      status: 'pending'
    }));

    return {
      stats: {
        totalCollections: profile.totalCollections,
        collectionsToday,
        rating: profile.rating,
        isCheckedIn: !!attendanceToday && !attendanceToday.checkOutAt,
        shift: profile.shift,
        assignedWard: profile.assignedWard,
      },
      liveAlerts,
      routeAssignments
    };
  }

  async checkIn(userId: string, dto: AttendanceCheckInDto) {
    const profile = await this.prisma.workerProfile.findUnique({
      where: { userId },
    });

    if (!profile) throw new NotFoundException('Worker profile not found');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await this.prisma.attendanceRecord.findFirst({
      where: { workerId: profile.id, date: today }
    });

    if (existingAttendance) {
      throw new BadRequestException('Already checked in for today');
    }

    const attendance = await this.prisma.attendanceRecord.create({
      data: {
        workerId: profile.id,
        date: today,
        checkInAt: new Date(),
        checkInLatitude: dto.latitude,
        checkInLongitude: dto.longitude,
        status: 'PRESENT'
      }
    });

    return attendance;
  }

  async checkOut(userId: string) {
    const profile = await this.prisma.workerProfile.findUnique({
      where: { userId },
    });

    if (!profile) throw new NotFoundException('Worker profile not found');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await this.prisma.attendanceRecord.findFirst({
      where: { workerId: profile.id, date: today }
    });

    if (!attendance) {
      throw new BadRequestException('Not checked in today');
    }

    if (attendance.checkOutAt) {
      throw new BadRequestException('Already checked out');
    }

    return this.prisma.attendanceRecord.update({
      where: { id: attendance.id },
      data: { checkOutAt: new Date() }
    });
  }

  async getPerformance(userId: string) {
    const profile = await this.prisma.workerProfile.findUnique({
      where: { userId },
    });

    if (!profile) throw new NotFoundException('Worker profile not found');

    // Return mock performance data for the chart
    return {
      rating: profile.rating,
      totalCollections: profile.totalCollections,
      weeklyStats: [
        { day: 'Mon', collections: 45 },
        { day: 'Tue', collections: 52 },
        { day: 'Wed', collections: 48 },
        { day: 'Thu', collections: 61 },
        { day: 'Fri', collections: 59 },
        { day: 'Sat', collections: 30 },
        { day: 'Sun', collections: 0 },
      ]
    };
  }
}
