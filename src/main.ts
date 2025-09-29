import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SuperTokensExceptionFilter } from 'supertokens-nestjs';
import supertokens from 'supertokens-node';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.enableCors({
    origin: configService.get('supertokens').appInfo.websiteDomain,
    allowedHeaders: ['content-type', ...supertokens.getAllCORSHeaders()],
    credentials: true,
  });
  app.useGlobalFilters(new SuperTokensExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(3000);
}
bootstrap();
