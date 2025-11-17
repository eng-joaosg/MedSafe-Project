import { Module, Global } from '@nestjs/common';
import { BcryptHashService } from '../services/bycrypt-hash.service';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: 'IHashService',
      useClass: BcryptHashService,
    },
  ],
  exports: ['IHashService'],
})
export class HashServiceModule {}
