import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ScanQrDto } from './dto/scan-qr.dto';
import { CollectionStatus } from '../../common/prisma-enums';;
import { randomBytes } from 'crypto';

@Injectable()
export class QrCodesService {
  constructor(private readonly prisma: PrismaService) {}

  async generateForHousehold(householdId: string) {
    const household = await this.prisma.household.findUnique({ where: { id: householdId } });
    if (!household) throw new NotFoundException('Household not found');

    const existing = await this.prisma.qRCode.findUnique({ where: { householdId } });
    if (existing) return existing;

    const uniqueCode = `SWACHH-QR-${randomBytes(6).toString('hex').toUpperCase()}`;

    return this.prisma.qRCode.create({
      data: {
        householdId,
        code: uniqueCode,
      }
    });
  }

  async getByHousehold(householdId: string) {
    const qrCode = await this.prisma.qRCode.findUnique({ where: { householdId } });
    if (!qrCode) throw new NotFoundException('QR Code not found for household');
    return qrCode;
  }

  async scan(workerUserId: string, dto: ScanQrDto) {
    const workerProfile = await this.prisma.workerProfile.findUnique({
      where: { userId: workerUserId }
    });

    if (!workerProfile) throw new NotFoundException('Worker profile not found');

    const qrCode = await this.prisma.qRCode.findUnique({
      where: { code: dto.code },
      include: { household: true }
    });

    if (!qrCode || !qrCode.isActive) {
      throw new BadRequestException('Invalid or inactive QR code');
    }

    // Check for duplicate scan within the last 12 hours
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    const recentCollection = await this.prisma.wasteCollection.findFirst({
      where: {
        qrCodeId: qrCode.id,
        collectedAt: { gte: twelveHoursAgo },
        status: { not: CollectionStatus.SKIPPED }
      }
    });

    if (recentCollection) {
      throw new BadRequestException('Waste already collected for this household today');
    }

    // Process collection
    const [collection] = await this.prisma.$transaction([
      this.prisma.wasteCollection.create({
        data: {
          householdId: qrCode.householdId,
          workerId: workerProfile.id,
          qrCodeId: qrCode.id,
          wasteType: dto.wasteType,
          weight: dto.weight,
          status: CollectionStatus.COLLECTED,
          collectedAt: new Date(),
          gpsLatitude: dto.gpsLatitude,
          gpsLongitude: dto.gpsLongitude,
          notes: dto.notes,
          imageUrl: dto.imageUrl,
        }
      }),
      this.prisma.qRCode.update({
        where: { id: qrCode.id },
        data: { 
          lastScannedAt: new Date(),
          totalScans: { increment: 1 }
        }
      }),
      this.prisma.workerProfile.update({
        where: { id: workerProfile.id },
        data: { totalCollections: { increment: 1 } }
      })
    ]);

    // Give points to citizen
    const citizenProfile = await this.prisma.citizenProfile.findFirst({
      where: { householdId: qrCode.householdId }
    });

    if (citizenProfile) {
      const pointsToAward = 10; // Base points for collection
      await this.prisma.rewardTransaction.create({
        data: {
          citizenId: citizenProfile.id,
          action: 'WASTE_COLLECTED',
          points: pointsToAward,
          description: `Waste collection recorded on ${new Date().toLocaleDateString()}`
        }
      });
      await this.prisma.citizenProfile.update({
        where: { id: citizenProfile.id },
        data: { rewardPoints: { increment: pointsToAward } }
      });
    }

    return collection;
  }
}
