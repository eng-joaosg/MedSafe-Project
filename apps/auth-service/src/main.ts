import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './presentation/filters/global-exception.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { TimingInterceptor } from './presentation/interceptors/timming.interceptor';
import { ApiKeyGuard } from './presentation/guards/api-key.guard';
import { ulid } from 'ulid';
import { CommonLogger } from './common/logger/common-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3003;
  const apiVersion = configService.get<string>('API_VERSION') || '1.0';
  const allowedOrigins =
    configService.get<string>('CORS_ALLOWED_ORIGINS')?.split(',') || [];

  // Adiciona requestId a cada requisição
  app.use((req, res, next) => {
    req.headers['x-request-id'] = req.headers['x-request-id'] || ulid();
    next();
  });

  if (allowedOrigins.length > 0) {
    app.enableCors({
      origin: allowedOrigins,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });
  }

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Interceptors globais
  app.useGlobalInterceptors(new TimingInterceptor());

  // Filtro de exceções global
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new GlobalExceptionFilter(httpAdapter));

  // Guardas globais
  app.useGlobalGuards(new ApiKeyGuard(configService));

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('MedSafe - Auth Service API')
    .setDescription(
      'API de Autenticação e Gestão de Identidade do Sistema MedSafe.',
    )
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

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);

  CommonLogger.info(
    'Bootstrap',
    'APPLICATION_START',
    `Application is running on: ${await app.getUrl()} in ${configService.get(
      'NODE_ENV',
    )} mode. Swagger: ${await app.getUrl()}/api/docs`,
  );
}
bootstrap().catch((err) => {
  console.error('Erro ao inicializar a aplicação:', err);
  process.exit(1);
});
