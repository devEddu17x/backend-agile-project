import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as config from './env';
@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
      load: [
        config.supertokensConfig,
        config.typeormConfig,
        config.cookieConfig,
      ],
    }),
  ],
})
export class ConfigModule {}
