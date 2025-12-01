import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ApplicationModule } from './application/application.module';
import { RequestContextService } from './common/request-context/context-context.service';
import { ClientUserAuthController } from './presentation/controllers/client-user.controller';
import { ClinicalInfoController } from './presentation/controllers/clinical-info.controller';
import { PublicClinicalInfoController } from './presentation/controllers/public.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),

    ApplicationModule,
  ],

  controllers: [ClientUserAuthController, ClinicalInfoController, PublicClinicalInfoController],
  providers: [RequestContextService],
  exports: [RequestContextService],
})
export class AppModule {}
