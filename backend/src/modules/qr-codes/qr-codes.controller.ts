import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { QrCodesService } from './qr-codes.service';
import { ScanQrDto } from './dto/scan-qr.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { UserRole } from '../../common/prisma-enums';;
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('qr-codes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('qr-codes')
export class QrCodesController {
  constructor(private readonly qrCodesService: QrCodesService) {}

  @Roles(UserRole.ADMIN)
  @Post('generate/:householdId')
  @ApiOperation({ summary: 'Generate QR code for a household (Admin)' })
  generateForHousehold(@Param('householdId') householdId: string) {
    return this.qrCodesService.generateForHousehold(householdId);
  }

  @Roles(UserRole.ADMIN, UserRole.CITIZEN)
  @Get(':householdId')
  @ApiOperation({ summary: 'Get QR code for a household' })
  getByHousehold(@Param('householdId') householdId: string) {
    return this.qrCodesService.getByHousehold(householdId);
  }

  @Roles(UserRole.WORKER)
  @Post('scan')
  @ApiOperation({ summary: 'Scan QR code and record waste collection (Worker)' })
  scan(@CurrentUser() user: JwtPayload, @Body() dto: ScanQrDto) {
    return this.qrCodesService.scan(user.sub, dto);
  }
}
