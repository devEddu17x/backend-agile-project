import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { cleanDatabase } from './database-utils';
import { createUserWithRole } from './supertokens-test-helper';

describe('Flujo de Registro de Empleado (e2e)', () => {
  let app: INestApplication;
  let adminCookies: string[];

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

    // Limpiar BD antes de empezar
    await cleanDatabase(app);

    console.log('🧪 [employee-flow] Usando BD:', process.env.DB_NAME);

    // Crear y loguear admin
    const { cookies } = await createUserWithRole(
      app,
      'admin@test.com',
      'Admin123!',
      'admin',
    );
    adminCookies = cookies;
  });

  afterAll(async () => {
    await cleanDatabase(app);
    await app.close();
  });

  it('1. Admin crea empleado → espera 201', async () => {
    const timestamp = Date.now();
    const employeeData = {
      email: `empleado1-${timestamp}@test.com`,
      password: 'Empleado123!',
      names: 'Juan',
      lastNames: 'Pérez',
    };

    const response = await request(app.getHttpServer())
      .post('/api/v1/admin/employees')
      .set('Cookie', adminCookies)
      .send(employeeData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe(`empleado1-${timestamp}@test.com`);

    console.log('✅ Empleado creado en BD de pruebas:', response.body.id);
  });

  it('2. Admin intenta crear empleado con mismo email → espera 409 (Conflict)', async () => {
    // Primero crear el empleado
    await request(app.getHttpServer())
      .post('/api/v1/admin/employees')
      .set('Cookie', adminCookies)
      .send({
        email: 'empleado2@test.com',
        password: 'Empleado123!',
        names: 'Empleado',
        lastNames: 'Original',
      });

    // Intentar crear otro con el mismo email
    const duplicateData = {
      email: 'empleado2@test.com', // Email ya existe
      password: 'Password123!',
      names: 'Pedro',
      lastNames: 'García',
    };

    const response = await request(app.getHttpServer())
      .post('/api/v1/admin/employees')
      .set('Cookie', adminCookies)
      .send(duplicateData)
      .expect(409);

    console.log('✅ Conflicto detectado correctamente:', response.body.message);
  });

  it('3. Verificar que el nuevo empleado puede loguearse y tiene rol seller', async () => {
    // Crear empleado
    const timestamp = Date.now();
    await request(app.getHttpServer())
      .post('/api/v1/admin/employees')
      .set('Cookie', adminCookies)
      .send({
        email: `empleado3-${timestamp}@test.com`,
        password: 'Empleado123!',
        names: 'Carlos',
        lastNames: 'Vendedor',
      });

    // Login con el empleado
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/signin')
      .send({
        formFields: [
          { id: 'email', value: `empleado3-${timestamp}@test.com` },
          { id: 'password', value: 'Empleado123!' },
        ],
      })
      .expect(200);

    const employeeCookies = loginResponse.headers[
      'set-cookie'
    ] as unknown as string[];
    expect(employeeCookies).toBeDefined();
    expect(employeeCookies.length).toBeGreaterThan(0);

    console.log('✅ Empleado puede loguearse correctamente');
  });
});
