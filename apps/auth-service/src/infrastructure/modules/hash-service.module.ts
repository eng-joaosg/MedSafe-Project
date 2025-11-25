import { Module, Global } from '@nestjs/common';
import { BcryptHashService } from '../services/bycrypt-hash.service';
import { HASH_SERVICE } from '../../common/utils/tokens.contants';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: HASH_SERVICE,
      useClass: BcryptHashService,
    },
  ],
  exports: [HASH_SERVICE],
})
export class HashServiceModule {}
