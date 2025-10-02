import { registerAs } from '@nestjs/config';

export default registerAs('cloudflare', () => {
  const {
    ACCOUNT_ID,
    ACCESS_KEY_ID,
    SECRET_ACCESS_KEY,
    BUCKET_NAME,
    BASE_URL,
  } = process.env;

  const missingVars = [
    ['ACCOUNT_ID', ACCOUNT_ID],
    ['ACCESS_KEY_ID', ACCESS_KEY_ID],
    ['SECRET_ACCESS_KEY', SECRET_ACCESS_KEY],
    ['BUCKET_NAME', BUCKET_NAME],
    ['BASE_URL', BASE_URL],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missingVars.length) {
    throw new Error(
      `Missing required Cloudflare env vars: ${missingVars.join(', ')}`,
    );
  }

  return {
    config: {
      region: 'auto',
      endpoint: BASE_URL,
      credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
      },
    },
    bucket: BUCKET_NAME,
  };
});
