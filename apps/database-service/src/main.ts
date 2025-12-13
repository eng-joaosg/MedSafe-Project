import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { CommonLogger } from './common/common-logger';
import { GlobalExceptionFilter } from './presentation/filters/global-exception.filter';
import { TimingInterceptor } from './presentation/interceptors/timming.interceptor';
import { RequestContextService } from './common/request-context/context-context.service';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const requestContext = app.get(RequestContextService);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 5000;
  const apiVersion = configService.get<string>('API_VERSION') || '1.0';

  // -----------------------------
  // Middleware para requestId
  // -----------------------------
  app.use((req, res, next) => {
    const requestId = req.headers['x-request-id'] as string;
    requestContext.run(() => {
      requestContext.set('requestId', requestId);
      next();
    });
  });

  // -----------------------------
  // Middleware para cookies
  // -----------------------------
  app.use(cookieParser());
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
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'api-key')
    .addCookieAuth('jwt-token', {
      type: 'apiKey',
      in: 'cookie',
    })
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // -----------------------------
  // Inicializa aplicação
  // -----------------------------
  await app.listen(port, '0.0.0.0');

  CommonLogger.info(
    'Bootstrap',
    'APPLICATION_START',
    `Application is running on: ${await app.getUrl()} in ${configService.get('NODE_ENV')} mode. Swagger: ${await app.getUrl()}/api/docs`,
  );
}

bootstrap().catch((err) => {
  console.error('Erro ao inicializar a aplicação:', err);
  process.exit(1);
});
