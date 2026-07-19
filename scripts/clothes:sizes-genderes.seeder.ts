import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { GenderEntity } from '../src/clothes/entities/gender.entity';
import { SizeEntity } from '../src/clothes/entities/size.entity';
import { CLOTHES_SIZES } from '../src/clothes/enum/size.enum';
import { CLOTHES_GENDER } from '../src/clothes/enum/gender.enum';

dotenv.config({ path: '.env.seed' });

// Database connection configuration
const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_SSL } =
  process.env;

const ssl =
  DB_SSL === 'true'
    ? {
        ssl: { rejectUnauthorized: false },
      }
    : {};

if (
  !DB_HOST ||
  !DB_PORT ||
  !DB_USERNAME ||
  !DB_PASSWORD ||
  !DB_NAME ||
  !DB_SSL
) {
  console.error('Missing seed credentials in environment variables');
  process.exit(1);
}

console.log('Starting Clothes Sizes & Genders seeder...');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: DB_HOST || 'localhost',
  port: DB_PORT ? parseInt(DB_PORT) : 5432,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  entities: [SizeEntity, GenderEntity],
  synchronize: true,
  logging: true,
  ...ssl,
  uuidExtension: 'pgcrypto',
});

async function main() {
  try {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');
  } catch (error) {
    console.error('Error initializing data source:', error);
    process.exit(1);
  }

  try {
    const sizeRepository = AppDataSource.getRepository(SizeEntity);
    const genderRepository = AppDataSource.getRepository(GenderEntity);

    const sizeEntities = Object.values(CLOTHES_SIZES).map((sizeValue) =>
      sizeRepository.create({ size: sizeValue }),
    );
    await sizeRepository.save(sizeEntities);
    console.log('Sizes seeded successfully!');

    const genderEntities = Object.values(CLOTHES_GENDER).map((genderValue) =>
      genderRepository.create({ gender: genderValue }),
    );
    await genderRepository.save(genderEntities);
    console.log('Genders seeded successfully!');
  } catch (e) {
    console.error('Error creating sizes and genders:', e);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }

  console.log('Clothes Sizes & Genders seeded successfully!');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
