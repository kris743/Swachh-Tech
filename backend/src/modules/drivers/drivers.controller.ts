import { Controller, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { UpdateLocationDto } from './dto/update-location.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { UserRole } from '../../common/prisma-enums';;
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('drivers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Roles(UserRole.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Get all drivers (Admin only)' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.driversService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  @Roles(UserRole.DRIVER)
  @Get('my-route')
  @ApiOperation({ summary: 'Get current assigned route for today' })
  getMyRoute(@CurrentUser() user: JwtPayload) {
    return this.driversService.getMyRoute(user.sub);
  }

  @Roles(UserRole.DRIVER)
  @Patch('location')
  @ApiOperation({ summary: 'Update driver/truck GPS location' })
  updateLocation(@CurrentUser() user: JwtPayload, @Body() dto: UpdateLocationDto) {
    return this.driversService.updateLocation(user.sub, dto);
  }

  @Roles(UserRole.DRIVER)
  @Get('summary')
  @ApiOperation({ summary: 'Get daily summary for driver' })
  getDailySummary(@CurrentUser() user: JwtPayload) {
    return this.driversService.getDailySummary(user.sub);
  }

  @Roles(UserRole.ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Get driver by ID' })
  findById(@Param('id') id: string) {
    return this.driversService.findById(id);
  }
}
