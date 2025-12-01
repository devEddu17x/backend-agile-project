// test/database-utils.ts
import { DataSource } from 'typeorm';
import { INestApplication } from '@nestjs/common';

export async function cleanDatabase(app: INestApplication) {
  const dataSource = app.get(DataSource);

  if (!dataSource || !dataSource.isInitialized) {
    console.warn('⚠️  DataSource no está inicializado');
    return;
  }

  const entities = dataSource.entityMetadatas;

  // Limpiar todas las tablas usando TRUNCATE CASCADE (PostgreSQL)
  // Excluir tablas de SuperTokens
  for (const entity of entities) {
    const tableName = entity.tableName;

    // Skip SuperTokens tables
    if (
      tableName.startsWith('supertokens_') ||
      tableName === 'all_auth_recipe_users' ||
      tableName === 'emailpassword_users' ||
      tableName === 'emailpassword_pswd_reset_tokens' ||
      tableName === 'emailverification_tokens' ||
      tableName === 'emailverification_verified_emails' ||
      tableName === 'jwt_signing_keys' ||
      tableName === 'key_value' ||
      tableName === 'passwordless_codes' ||
      tableName === 'passwordless_devices' ||
      tableName === 'passwordless_users' ||
      tableName === 'role_permissions' ||
      tableName === 'roles' ||
      tableName === 'session_access_token_signing_keys' ||
      tableName === 'session_info' ||
      tableName === 'thirdparty_users' ||
      tableName === 'totp_used_codes' ||
      tableName === 'totp_user_devices' ||
      tableName === 'totp_users' ||
      tableName === 'user_metadata' ||
      tableName === 'user_roles' ||
      tableName === 'userid_mapping'
    ) {
      continue;
    }

    try {
      await dataSource.query(`TRUNCATE TABLE "${tableName}" CASCADE;`);
    } catch (error) {
      console.warn(`⚠️  No se pudo limpiar tabla ${tableName}:`, error.message);
    }
  }

  console.log('🧹 Base de datos limpiada');
}
