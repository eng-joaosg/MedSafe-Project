import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { TimingInterceptor } from './presentation/interceptors/timming.interceptor';
import { ApiKeyGuard } from './presentation/guards/api-key.guard';
import { RequestIdMiddleware } from './presentation/middleware/request-id.middleware';
import { CommonLogger } from './common/logger/common.logger';
import { RequestContextService } from './common/request-context/request-context.service';
import { GlobalExceptionFilter } from './presentation/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const requestContext = app.get(RequestContextService);
  CommonLogger.setRequestContext(requestContext);
  app.use(new RequestIdMiddleware(requestContext).use);

  const configService = app.get(ConfigService);

  const env = configService.get<string>('NODE_ENV');
  if (env !== 'DEV') return;

  const port = configService.get<number>('PORT') || 3003;
  const apiVersion = configService.get<string>('API_VERSION') || '1.0';
  const allowedOrigins = configService.get<string>('CORS_ALLOWED_ORIGINS')?.split(',') || [];

  if (allowedOrigins.length > 0) {
    app.enableCors({
      origin: allowedOrigins,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });
  }

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
  app.useGlobalInterceptors(new TimingInterceptor());

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new GlobalExceptionFilter(httpAdapter));
  app.useGlobalGuards(new ApiKeyGuard(configService));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('MedSafe - Auth Service API')
    .setDescription('API de Autenticação e Gestão de Identidade do Sistema MedSafe.')
    .setVersion(apiVersion)
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'Chave de autenticação do serviço',
      },
      'api-key',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);

  CommonLogger.info(
    'Bootstrap',
    'APPLICATION_START',
    `Application running on: ${await app.getUrl()} in ${configService.get('NODE_ENV')} mode. Swagger: ${await app.getUrl()}/api/docs`,
  );
}

bootstrap().catch((err) => {
  console.error('Erro ao inicializar a aplicação:', err);
  process.exit(1);
});
