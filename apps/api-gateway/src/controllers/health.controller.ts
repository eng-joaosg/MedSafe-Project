import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthCheck, HealthCheckService, HttpHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly config: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    const apiGatewayUrl = this.config.get<string>(
      'API_GATEWAY_URL',
      'http://localhost:3000/health/self',
    );

    return this.health.check([() => this.http.pingCheck('api-gateway', apiGatewayUrl)]);
  }

  @Get('self')
  checkSelf(): { status: string; service: string } {
    return { status: 'ok', service: 'api-gateway' };
  }
}
