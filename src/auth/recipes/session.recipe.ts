import Session from 'supertokens-node/recipe/session';
import { ConfigService } from '@nestjs/config';

export function buildSessionRecipe(deps: { config: ConfigService }) {
  const { config } = deps;

  // opcional: leer desde env/config
  const cookieDomain = config.get<string>('auth.cookieDomain') ?? 'localhost';
  const cookieSameSite =
    (config.get<string>('auth.cookieSameSite') as 'lax' | 'strict' | 'none') ??
    'lax';
  const cookieSecure = config.get<boolean>('auth.cookieSecure') ?? false;

  return Session.init({
    getTokenTransferMethod: () => 'cookie',
    cookieDomain,
    cookieSameSite,
    cookieSecure,
  });
}
