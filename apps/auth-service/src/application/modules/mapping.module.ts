import { Module } from '@nestjs/common';
import { ClientUserMapper } from '../mapping/client-user.mapper';
import { CLIENT_USER_MAPPER } from '../../common/utils/tokens.contants';

@Module({
  providers: [
    {
      provide: CLIENT_USER_MAPPER,
      useClass: ClientUserMapper,
    },
  ],
  exports: [CLIENT_USER_MAPPER],
})
export class MappingModule {}
