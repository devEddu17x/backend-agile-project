import { registerAs } from '@nestjs/config';

export default registerAs('cookie', () => {
  const { COOKIE_DOMAIN, COOKIE_SAME_SITE, COOKIE_SECURE } = process.env;

  return {
    cookieSameSite: COOKIE_SAME_SITE,
    cookieSecure: COOKIE_SECURE === 'true',
    ...(COOKIE_DOMAIN ? { cookieDomain: COOKIE_DOMAIN } : {}),
  };
});
