import { Controller, Get, Patch, Body, Query, UseGuards } from '@nestjs/common';
import { CitizensService } from './citizens.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { UserRole } from '../../common/prisma-enums';;
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('citizens')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('citizens')
export class CitizensController {
  constructor(private readonly citizensService: CitizensService) {}

  @Roles(UserRole.CITIZEN)
  @Get('profile')
  @ApiOperation({ summary: 'Get citizen profile' })
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.citizensService.getProfile(user.sub);
  }

  @Roles(UserRole.CITIZEN)
  @Patch('profile')
  @ApiOperation({ summary: 'Update citizen profile' })
  updateProfile(@CurrentUser() user: JwtPayload, @Body() updateData: any) {
    return this.citizensService.updateProfile(user.sub, updateData);
  }

  @Roles(UserRole.CITIZEN)
  @Get('dashboard')
  @ApiOperation({ summary: 'Get citizen dashboard statistics' })
  getDashboard(@CurrentUser() user: JwtPayload) {
    return this.citizensService.getDashboard(user.sub);
  }

  @Roles(UserRole.CITIZEN)
  @Get('collection-history')
  @ApiOperation({ summary: 'Get citizen waste collection history' })
  getCollectionHistory(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.citizensService.getCollectionHistory(
      user.sub,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  @Roles(UserRole.CITIZEN)
  @Get('leaderboard')
  @ApiOperation({ summary: 'Get citizen reward leaderboard' })
  getLeaderboard() {
    return this.citizensService.getLeaderboard();
  }
}
