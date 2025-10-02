import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { CustomerModule } from './customer/customer.module';
import { EmployeeModule } from './employee/employee.module';
import { ClothesModule } from './clothes/clothes.module';
import { AdminModule } from './admin/admin.module';
import { LoggerModule } from 'nestjs-pino';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        return configService.get('typeorm');
      },
      inject: [ConfigService],
    }),
    LoggerModule.forRootAsync({
      useFactory(configService: ConfigService) {
        return configService.get('pino-logger');
      },
      inject: [ConfigService],
    }),
    ConfigModule,
    AuthModule,
    CustomerModule,
    EmployeeModule,
    ClothesModule,
    AdminModule,
    StorageModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
