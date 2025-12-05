import { registerAs } from '@nestjs/config';

export default registerAs('email', () => {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM } =
    process.env;

  const missingVars = [
    ['EMAIL_HOST', EMAIL_HOST],
    ['EMAIL_PORT', EMAIL_PORT],
    ['EMAIL_USER', EMAIL_USER],
    ['EMAIL_PASS', EMAIL_PASS],
    ['EMAIL_FROM', EMAIL_FROM],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missingVars.length) {
    throw new Error(
      `Missing required Cloudflare env vars: ${missingVars.join(', ')}`,
    );
  }

  return {
    smtp: {
      host: EMAIL_HOST,
      port: parseInt(EMAIL_PORT, 10),
      secure: EMAIL_PORT === '465',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    },
    from: EMAIL_FROM,
  };
});
