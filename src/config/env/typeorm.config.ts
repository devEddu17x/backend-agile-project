import { registerAs } from '@nestjs/config';

export default registerAs('typeorm', () => {
  const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;

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
      `Missing required SuperTokens env vars: ${missingVars.join(', ')}`,
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
    entities: [],
    synchronize: true,
  };
});
