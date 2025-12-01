// test/setup-e2e.ts
import { config } from 'dotenv';
import { join } from 'path';

// Cargar variables de entorno de .env.test
config({ path: join(__dirname, '..', '.env.test') });

// Opcional: Configurar timeouts globales
jest.setTimeout(30000);

beforeAll(async () => {
  console.log('🧪 Iniciando tests E2E con BD de pruebas');
  console.log('📦 Base de datos:', process.env.DB_NAME);
});

afterAll(async () => {
  console.log('✅ Tests E2E completados');
});
