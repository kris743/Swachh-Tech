import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintStatusDto } from './dto/update-complaint-status.dto';
import { AssignComplaintDto } from './dto/assign-complaint.dto';
import { MediaType } from '../../common/prisma-enums';
import { ComplaintStatus } from '../../common/prisma-enums';
import { ComplaintType } from '../../common/prisma-enums';;
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ComplaintsService {
  private readonly aiServiceUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL') || 'http://localhost:8000';
  }

  async create(userId: string, dto: CreateComplaintDto) {
    const citizenProfile = await this.prisma.citizenProfile.findUnique({
      where: { userId },
    });

    if (!citizenProfile) throw new NotFoundException('Citizen profile not found');

    let aiClassification = null;
    let aiConfidence = null;

    // Call AI Service if image is provided
    if (dto.imageUrl) {
      try {
        const response = await axios.post(`${this.aiServiceUrl}/api/ai/classify-complaint`, {
          imageUrl: dto.imageUrl,
          description: dto.description
        });
        
        if (response.data && response.data.classification) {
          aiClassification = response.data.classification;
          aiConfidence = response.data.confidence;
        }
      } catch (error) {
        console.error('AI Service classification failed:', error.message);
        // We don't fail the complaint creation if AI service is down
      }
    }

    const complaint = await this.prisma.complaint.create({
      data: {
        citizenId: citizenProfile.id,
        type: dto.type,
        description: dto.description,
        status: ComplaintStatus.PENDING,
        gpsLatitude: dto.gpsLatitude,
        gpsLongitude: dto.gpsLongitude,
        address: dto.address,
        aiClassification,
        aiConfidence,
        media: dto.imageUrl ? {
          create: [{ url: dto.imageUrl, type: MediaType.IMAGE }]
        } : undefined
      },
      include: { media: true }
    });

    return complaint;
  }

  async findAll(page: number = 1, limit: number = 10, status?: ComplaintStatus, type?: ComplaintType) {
    const skip = (page - 1) * limit;
    
    let where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const [complaints, total] = await Promise.all([
      this.prisma.complaint.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          citizen: { include: { user: { select: { firstName: true, lastName: true } } } },
          assignedTo: { select: { firstName: true, lastName: true } },
          verifiedBy: { include: { user: { select: { firstName: true, lastName: true } } } },
        }
      }),
      this.prisma.complaint.count({ where }),
    ]);

    return {
      data: complaints,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
      include: {
        citizen: { include: { user: { select: { firstName: true, lastName: true, phone: true } }, household: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true, role: true } },
        verifiedBy: { include: { user: { select: { firstName: true, lastName: true } } } },
        media: true
      }
    });

    if (!complaint) throw new NotFoundException('Complaint not found');
    return complaint;
  }

  async updateStatus(id: string, dto: UpdateComplaintStatusDto) {
    const complaint = await this.prisma.complaint.findUnique({ where: { id } });
    if (!complaint) throw new NotFoundException('Complaint not found');

    const dataToUpdate: any = { status: dto.status };

    if (dto.status === ComplaintStatus.RESOLVED || dto.status === ComplaintStatus.REJECTED) {
      dataToUpdate.resolvedAt = new Date();
      if (dto.resolutionNotes) {
        dataToUpdate.resolutionNotes = dto.resolutionNotes;
      }
    }

    const updatedComplaint = await this.prisma.complaint.update({
      where: { id },
      data: dataToUpdate,
    });

    // If resolved, award points to citizen
    if (dto.status === ComplaintStatus.RESOLVED && complaint.status !== ComplaintStatus.RESOLVED) {
      const pointsToAward = 25;
      await this.prisma.rewardTransaction.create({
        data: {
          citizenId: complaint.citizenId,
          action: 'COMPLAINT_RESOLVED',
          points: pointsToAward,
          description: `Your complaint regarding ${complaint.type} has been resolved.`
        }
      });
      await this.prisma.citizenProfile.update({
        where: { id: complaint.citizenId },
        data: { rewardPoints: { increment: pointsToAward } }
      });
    }

    return updatedComplaint;
  }

  async assign(id: string, dto: AssignComplaintDto) {
    const complaint = await this.prisma.complaint.findUnique({ where: { id } });
    if (!complaint) throw new NotFoundException('Complaint not found');

    return this.prisma.complaint.update({
      where: { id },
      data: {
        assignedToId: dto.assignedToId,
        status: ComplaintStatus.ASSIGNED
      }
    });
  }

  async getStats() {
    const stats = await this.prisma.complaint.groupBy({
      by: ['status'],
      _count: { _all: true }
    });

    return stats.map(s => ({
      status: s.status,
      count: s._count._all
    }));
  }
}
