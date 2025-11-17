import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import serverlessExpress from '@vendia/serverless-express';
import { Handler, APIGatewayProxyEvent, APIGatewayProxyResult, Context, Callback } from 'aws-lambda';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { TimingInterceptor } from './presentation/interceptors/timming.interceptor';
import { ApiKeyGuard } from './presentation/guards/api-key.guard';
import { RequestIdMiddleware } from './presentation/middleware/request-id.middleware';
import { CommonLogger } from './common/logger/common.logger';
import { RequestContextService } from './common/request-context/request-context.service';
import { GlobalExceptionFilter } from './presentation/filters/global-exception.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

let cachedServer: Handler;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const requestContext = app.get(RequestContextService);
  CommonLogger.setRequestContext(requestContext);
  app.use(new RequestIdMiddleware(requestContext).use);

  const configService = app.get(ConfigService);
  const env = configService.get<string>('NODE_ENV');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
  app.useGlobalInterceptors(new TimingInterceptor());
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new GlobalExceptionFilter(httpAdapter));
  app.useGlobalGuards(new ApiKeyGuard(configService));

  if (env === 'DEV') {
    const apiVersion = configService.get<string>('API_VERSION') || '1.0';
    const swaggerConfig = new DocumentBuilder()
      .setTitle('MedSafe - Auth Service API')
      .setDescription('API de Autenticação e Gestão de Identidade do Sistema MedSafe.')
      .setVersion(apiVersion)
      .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header', description: 'Chave de autenticação do serviço' }, 'api-key')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.init();
  return serverlessExpress({ app: app.getHttpAdapter().getInstance() });
}

export const handler: Handler = async (event: APIGatewayProxyEvent, context: Context, callback: Callback<APIGatewayProxyResult>) => {
  if (!cachedServer) {
    cachedServer = await bootstrap();
  }

  return cachedServer(event, context, callback);
};
