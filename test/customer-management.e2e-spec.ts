// test/customer-management.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { cleanDatabase } from './database-utils';
import { createUserWithRole } from './supertokens-test-helper';

describe('Gestión de Clientes (e2e)', () => {
  let app: INestApplication;
  let sellerCookies: string[];

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

    console.log('🧪 [customer-management] Usando BD:', process.env.DB_NAME);

    // Crear y loguear seller
    const { cookies } = await createUserWithRole(
      app,
      'seller@test.com',
      'Seller123!',
      'seller',
    );
    sellerCookies = cookies;
  });

  afterAll(async () => {
    await cleanDatabase(app);
    await app.close();
  });

  it('1. Registra un cliente (201 Created)', async () => {
    const customerData = {
      names: 'Cliente',
      lastNames: 'Test Apellido',
      phone: '987654321',
      reference: 'Av. Principal 123',
    };

    const response = await request(app.getHttpServer())
      .post('/api/v1/customers')
      .set('Cookie', sellerCookies)
      .send(customerData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.names).toBe('Cliente');
    expect(response.body.lastNames).toBe('Test Apellido');

    console.log('✅ Cliente creado en BD de pruebas:', response.body.id);
  });

  it('2. Intenta registrar con datos incompletos (400 Bad Request)', async () => {
    const incompleteData = {
      names: 'Cliente',
      // Falta lastNames y phone (requeridos)
    };

    const response = await request(app.getHttpServer())
      .post('/api/v1/customers')
      .set('Cookie', sellerCookies)
      .send(incompleteData)
      .expect(400);

    expect(response.body.message).toBeDefined();
    console.log(
      '✅ Validación de datos incompletos funciona:',
      response.body.message,
    );
  });

  it('3. Consulta la lista y verifica que el cliente nuevo está ahí', async () => {
    // Crear un cliente primero
    await request(app.getHttpServer())
      .post('/api/v1/customers')
      .set('Cookie', sellerCookies)
      .send({
        names: 'Cliente',
        lastNames: 'Listado Apellido',
        phone: '999888777',
        reference: 'Calle Test 789',
      });

    // Consultar la lista
    const response = await request(app.getHttpServer())
      .get('/api/v1/customers')
      .set('Cookie', sellerCookies)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);

    const newCustomer = response.body.find((c: any) => c.phone === '999888777');

    expect(newCustomer).toBeDefined();
    expect(newCustomer.names).toBe('Cliente');
    expect(newCustomer.lastNames).toBe('Listado Apellido');

    console.log(
      '✅ Cliente encontrado en la lista, total:',
      response.body.length,
    );
  });
});
