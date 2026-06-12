import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip, headers } = request;
    const user = request.user;
    const userAgent = headers['user-agent'] || '';

    return next.handle().pipe(
      tap({
        next: () => {
          // Only log mutating operations
          if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            this.logAction(user?.id, method, url, ip, userAgent).catch((err) =>
              this.logger.error('Failed to write audit log', err),
            );
          }
        },
        error: () => {
          // Log errors for all mutating operations
          if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            this.logAction(user?.id, `${method}_ERROR`, url, ip, userAgent).catch(
              (err) => this.logger.error('Failed to write audit log', err),
            );
          }
        },
      }),
    );
  }

  private async logAction(
    userId: string | undefined,
    action: string,
    entity: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        entity,
        ipAddress,
        userAgent,
      },
    });
  }
}
