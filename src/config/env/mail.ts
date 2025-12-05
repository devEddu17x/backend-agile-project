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
      connectionTimeout: 60000, // 60 segundos
      greetingTimeout: 30000, // 30 segundos
      socketTimeout: 60000, // 60 segundos
      // Habilitar STARTTLS para puerto 587
      requireTLS: EMAIL_PORT === '587',
      tls: {
        // No fallar en certificados auto-firmados (útil para desarrollo)
        rejectUnauthorized: process.env.NODE_ENV === 'production',
      },
    },
    from: EMAIL_FROM,
  };
});
