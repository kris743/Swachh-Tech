import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintStatusDto } from './dto/update-complaint-status.dto';
import { AssignComplaintDto } from './dto/assign-complaint.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { ComplaintStatus } from '../../common/prisma-enums';
import { ComplaintType } from '../../common/prisma-enums';
import { UserRole } from '../../common/prisma-enums';;
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('complaints')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Roles(UserRole.CITIZEN)
  @Post()
  @ApiOperation({ summary: 'Create a new complaint' })
  create(@CurrentUser() user: JwtPayload, @Body() createComplaintDto: CreateComplaintDto) {
    return this.complaintsService.create(user.sub, createComplaintDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all complaints' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: ComplaintStatus,
    @Query('type') type?: ComplaintType,
  ) {
    return this.complaintsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      status,
      type,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get complaint statistics' })
  getStats() {
    return this.complaintsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get complaint by ID' })
  findById(@Param('id') id: string) {
    return this.complaintsService.findById(id);
  }

  @Roles(UserRole.ADMIN, UserRole.WORKER)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update complaint status' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateComplaintStatusDto,
  ) {
    return this.complaintsService.updateStatus(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/assign')
  @ApiOperation({ summary: 'Assign complaint to a user' })
  assign(
    @Param('id') id: string,
    @Body() dto: AssignComplaintDto,
  ) {
    return this.complaintsService.assign(id, dto);
  }
}
