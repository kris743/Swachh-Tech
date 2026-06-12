import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/prisma-enums';;
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Roles(UserRole.ADMIN)
  @Get('dashboard')
  @ApiOperation({ summary: 'Get main admin dashboard KPIs' })
  getDashboard() {
    return this.analyticsService.getDashboard();
  }

  @Roles(UserRole.ADMIN)
  @Get('waste-trends')
  @ApiOperation({ summary: 'Get waste collection trends over time' })
  getWasteTrends() {
    return this.analyticsService.getWasteTrends();
  }

  @Roles(UserRole.ADMIN)
  @Get('complaints')
  @ApiOperation({ summary: 'Get complaint distribution by type' })
  getComplaintStats() {
    return this.analyticsService.getComplaintStats();
  }

  @Roles(UserRole.ADMIN)
  @Get('wards/:ward')
  @ApiOperation({ summary: 'Get historical analytics for a specific ward' })
  getWardAnalytics(@Param('ward') ward: string) {
    return this.analyticsService.getWardAnalytics(ward);
  }
}
