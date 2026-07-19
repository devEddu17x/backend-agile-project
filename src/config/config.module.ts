import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as config from './env';
@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: [
        '.env.local',
        '.env.development.local',
        '.env.production.local',
      ],
      isGlobal: true,
      load: [
        config.supertokensConfig,
        config.typeormConfig,
        config.cookieConfig,
        config.apiConfig,
        config.pinoLoggerConfig,
        config.cloudflare,
        config.emailConfig,
      ],
    }),
  ],
})
export class ConfigModule {}
