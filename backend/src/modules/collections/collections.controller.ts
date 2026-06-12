import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CollectionStatus } from '../../common/prisma-enums';
import { UserRole } from '../../common/prisma-enums';;
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('collections')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Roles(UserRole.ADMIN, UserRole.WORKER)
  @Get()
  @ApiOperation({ summary: 'Get all collections' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('ward') ward?: string,
    @Query('status') status?: CollectionStatus,
  ) {
    return this.collectionsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      ward,
      status,
    );
  }

  @Roles(UserRole.ADMIN)
  @Get('stats')
  @ApiOperation({ summary: 'Get collection statistics' })
  getStats() {
    return this.collectionsService.getStats();
  }

  @Roles(UserRole.ADMIN)
  @Get('by-ward/:ward')
  @ApiOperation({ summary: 'Get collections by ward' })
  getByWard(
    @Param('ward') ward: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.collectionsService.getByWard(
      ward,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  @Roles(UserRole.ADMIN, UserRole.WORKER)
  @Get(':id')
  @ApiOperation({ summary: 'Get collection by ID' })
  findById(@Param('id') id: string) {
    return this.collectionsService.findById(id);
  }
}
