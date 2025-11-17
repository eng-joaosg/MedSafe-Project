import { Module } from '@nestjs/common';
import { ClientUserMapper } from '../mapping/client-user.mapper';

@Module({
  providers: [
    {
      provide: 'IClientUserMapper',
      useClass: ClientUserMapper,
    },
  ],
  exports: ['IClientUserMapper'],
})
export class MappingModule {}
