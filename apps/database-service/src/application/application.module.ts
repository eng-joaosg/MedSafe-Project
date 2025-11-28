import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ClientUserService } from './services/client-user.service';
import { KnexClientUserRepository } from '../database/repositories/knex-client-user.repository';
import { ClinicalInfoService } from './services/clinical-info.service';
import { KnexClinicalInfoRepository } from 'src/database/repositories/knex-clinical-info.repositoty';
import {
  CLIENT_USER_REPOSITORY,
  CLIENT_USER_SERVICE,
  CLINICAL_INFO_REPOSITORY,
  CLINICAL_INFO_SERVICE,
} from '../common/contants/tokens.contants';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: CLIENT_USER_SERVICE,
      useClass: ClientUserService,
    },
    {
      provide: CLIENT_USER_REPOSITORY,
      useClass: KnexClientUserRepository,
    },
    {
      provide: CLINICAL_INFO_SERVICE,
      useClass: ClinicalInfoService,
    },
    {
      provide: CLINICAL_INFO_REPOSITORY,
      useClass: KnexClinicalInfoRepository,
    },
  ],
  exports: [CLIENT_USER_SERVICE, CLIENT_USER_REPOSITORY, CLINICAL_INFO_SERVICE, CLINICAL_INFO_REPOSITORY],
})
export class ApplicationModule {}
