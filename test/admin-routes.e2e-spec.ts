import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { cleanDatabase } from './database-utils';
import { createUserWithRole } from './supertokens-test-helper';

describe('AdminController - Protección de Rutas (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Verificar que estamos en modo test
    expect(process.env.NODE_ENV).toBe('local');
    expect(process.env.DB_NAME).toBe('test_db');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    console.log('🧪 [admin-routes] Usando BD:', process.env.DB_NAME);
  });

  beforeEach(async () => {
    // Limpiar BD antes de cada test
    await cleanDatabase(app);
  });

  afterAll(async () => {
    await cleanDatabase(app);
    await app.close();
  });

  describe('GET /admin/roles', () => {
    it('debe denegar acceso sin cookie de sesión', () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/roles')
        .expect(500); // SuperTokens lanza error antes del guard de roles
    });

    it('debe devolver 403 Forbidden con usuario no-admin', async () => {
      // Registrar usuario normal
      await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send({
          formFields: [
            { id: 'email', value: 'usuario@test.com' },
            { id: 'password', value: 'Password123!' },
          ],
        });

      // Login con usuario normal
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/signin')
        .send({
          formFields: [
            { id: 'email', value: 'usuario@test.com' },
            { id: 'password', value: 'Password123!' },
          ],
        });

      const cookies = loginResponse.headers[
        'set-cookie'
      ] as unknown as string[];

      // Intentar acceder a ruta de admin (debe fallar)
      return request(app.getHttpServer())
        .get('/api/v1/admin/roles')
        .set('Cookie', cookies)
        .expect(403);
    });

    it('debe permitir acceso a usuario admin', async () => {
      // Crear y loguear admin
      const { cookies } = await createUserWithRole(
        app,
        'admin@test.com',
        'Admin123!',
        'admin',
      );

      // Debe permitir acceso
      return request(app.getHttpServer())
        .get('/api/v1/admin/roles')
        .set('Cookie', cookies)
        .expect(200);
    });
  });
});
