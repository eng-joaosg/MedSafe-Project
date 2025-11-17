import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { CommonLoggerGateway } from './common/common.logger';
import { GlobalExceptionFilter } from './common/global-exception.filter';
import { TimingInterceptor } from './common/timming.interceptor';
import { RequestIdMiddleware } from './common/request-id.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3003;
  const apiVersion = configService.get<string>('API_VERSION') || '1.0';
  const allowedOrigins = configService.get<string>('CORS_ALLOWED_ORIGINS')?.split(',') || [];

  // -----------------------------
  // CORS
  // -----------------------------
  if (allowedOrigins.length > 0) {
    app.enableCors({
      origin: allowedOrigins,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });
  }

  // Middleware global
  app.use(new RequestIdMiddleware().use);

  // -----------------------------
  // Pipes globais
  // -----------------------------
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // -----------------------------
  // Interceptors globais
  // -----------------------------
  app.useGlobalInterceptors(new TimingInterceptor());

  // -----------------------------
  // Filtro de exceções global
  // -----------------------------
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new GlobalExceptionFilter(httpAdapter));

  // -----------------------------
  // Swagger
  // -----------------------------
  const swaggerConfig = new DocumentBuilder()
    .setTitle('MedSafe - Database Service API')
    .setDescription('API de acesso a banco do Sistema MedSafe.')
    .setVersion(apiVersion)
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // -----------------------------
  // Inicializa aplicação
  // -----------------------------
  await app.listen(port);

  CommonLoggerGateway.info(
    'Bootstrap',
    'APPLICATION_START',
    `Application is running on: ${await app.getUrl()} in ${configService.get('NODE_ENV')} mode. Swagger: ${await app.getUrl()}/api/docs`,
  );
}

bootstrap().catch((err) => {
  console.error('Erro ao inicializar a aplicação:', err);
  process.exit(1);
});
