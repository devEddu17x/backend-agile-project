import { registerAs } from '@nestjs/config';
import { ClothesVariantEntity } from 'src/clothes/entities/clothes-variant.entity';
import { ClothesEntity } from 'src/clothes/entities/clothes.entity';
import { GenderEntity } from 'src/clothes/entities/gender.entity';
import { ClotheImageEntity } from 'src/clothes/entities/images.entity';
import { SizeEntity } from 'src/clothes/entities/size.entity';
import { CustomerEntity } from 'src/customer/entities/customer.entity';
import { EmployeeEntity } from 'src/employee/entities/employee.entity';
import { QuoteDetailEntity } from 'src/quote/entities/quote-detail.entity';
import { QuoteEntity } from 'src/quote/entities/quote.entity';

export default registerAs('typeorm', () => {
  const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_SSL } =
    process.env;

  const missingVars = [
    ['DB_HOST', DB_HOST],
    ['DB_PORT', DB_PORT],
    ['DB_USERNAME', DB_USERNAME],
    ['DB_NAME', DB_NAME],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missingVars.length) {
    throw new Error(
      `Missing required database env vars: ${missingVars.join(', ')}`,
    );
  }

  if (!DB_PORT || isNaN(Number(DB_PORT))) {
    throw new Error(`DB_PORT must be a valid number, got: ${DB_PORT}`);
  }

  return {
    type: 'postgres',
    host: DB_HOST,
    port: DB_PORT,
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME,
    entities: [
      CustomerEntity,
      EmployeeEntity,
      ClothesVariantEntity,
      ClotheImageEntity,
      ClothesEntity,
      SizeEntity,
      GenderEntity,
      QuoteEntity,
      QuoteDetailEntity,
    ],
    synchronize: process.env.NODE_ENV !== 'production',
    ssl:
      DB_SSL === 'true'
        ? {
            require: true,
            rejectUnauthorized: false,
          }
        : false,
    uuidExtension: 'pgcrypto',
  };
});
