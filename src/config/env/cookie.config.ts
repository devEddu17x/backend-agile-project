import { registerAs } from '@nestjs/config';

export default registerAs('cookie', () => {
  const { COOKIE_DOMAIN, COOKIE_SAME_SITE, COOKIE_SECURE, NODE_ENV } =
    process.env;

  return {
    cookieSameSite: COOKIE_SAME_SITE,
    cookieSecure: COOKIE_SECURE === 'true',
    antiCsrf: NODE_ENV === 'local' ? 'NONE' : 'VIA_TOKEN',
    ...(COOKIE_DOMAIN ? { cookieDomain: COOKIE_DOMAIN } : {}),
  };
});
