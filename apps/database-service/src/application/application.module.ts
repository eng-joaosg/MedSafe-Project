import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ClientUserService } from './services/client-user.service';
import { KnexClientUserRepository } from '../database/repositories/knex-client-user.repository';
import { EventService } from './services/event.service';
import { DynamoEventRepository } from 'src/database/repositories/dynamo-event.repository';

@Module({
  imports: [DatabaseModule],
  providers: [
    ClientUserService,
    {
      provide: 'IClientUserRepository',
      useClass: KnexClientUserRepository,
    },
    EventService,
    {
      provide: 'IEventRepository',
      useClass: DynamoEventRepository,
    },
  ],
  exports: [ClientUserService, 'IClientUserRepository', EventService, 'IEventRepository'],
})
export class ApplicationModule {}
