import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { WorkersService } from './workers.service';
import { AttendanceCheckInDto } from './dto/attendance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { UserRole } from '../../common/prisma-enums';;
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('workers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('workers')
export class WorkersController {
  constructor(private readonly workersService: WorkersService) {}

  @Roles(UserRole.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Get all workers (Admin only)' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('ward') ward?: string,
  ) {
    return this.workersService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      ward,
    );
  }

  @Roles(UserRole.WORKER)
  @Get('my-dashboard')
  @ApiOperation({ summary: 'Get worker dashboard' })
  getDashboard(@CurrentUser() user: JwtPayload) {
    return this.workersService.getDashboard(user.sub);
  }

  @Roles(UserRole.WORKER)
  @Post('attendance/check-in')
  @ApiOperation({ summary: 'Check in for duty' })
  checkIn(@CurrentUser() user: JwtPayload, @Body() dto: AttendanceCheckInDto) {
    return this.workersService.checkIn(user.sub, dto);
  }

  @Roles(UserRole.WORKER)
  @Post('attendance/check-out')
  @ApiOperation({ summary: 'Check out from duty' })
  checkOut(@CurrentUser() user: JwtPayload) {
    return this.workersService.checkOut(user.sub);
  }

  @Roles(UserRole.WORKER)
  @Get('performance')
  @ApiOperation({ summary: 'Get worker performance' })
  getPerformance(@CurrentUser() user: JwtPayload) {
    return this.workersService.getPerformance(user.sub);
  }

  @Roles(UserRole.ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Get worker by ID' })
  findById(@Param('id') id: string) {
    return this.workersService.findById(id);
  }
}
