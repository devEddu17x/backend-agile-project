import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { cleanDatabase } from './database-utils';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    // Verificar que estamos en modo test
    expect(process.env.NODE_ENV).toBe('local');
    expect(process.env.DB_NAME).toBe('test_db');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();

    await cleanDatabase(app);

    console.log('🧪 [app] Usando BD:', process.env.DB_NAME);
  });

  afterAll(async () => {
    await cleanDatabase(app);
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1')
      .expect(200)
      .expect('Hello World!');
  });
});
