import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { UserRole } from '../../common/prisma-enums';;
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('rewards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Roles(UserRole.CITIZEN)
  @Get('my-wallet')
  @ApiOperation({ summary: 'Get citizen reward wallet and points' })
  getWallet(@CurrentUser() user: JwtPayload) {
    return this.rewardsService.getWallet(user.sub);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get top citizens leaderboard' })
  getLeaderboard() {
    return this.rewardsService.getLeaderboard();
  }

  @Roles(UserRole.CITIZEN)
  @Get('transactions')
  @ApiOperation({ summary: 'Get citizen reward transaction history' })
  getTransactions(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.rewardsService.getTransactions(
      user.sub,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }
}
