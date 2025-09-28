import Session from 'supertokens-node/recipe/session';
import { ConfigService } from '@nestjs/config';
import { AppUserIdClaim } from '../claims/app-user-id.claim';

export function buildSessionRecipe(dependencies: { config: ConfigService }) {
  const { config } = dependencies;

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
    override: {
      functions: (original) => ({
        ...original,
        async createNewSession(input) {
          const session = await original.createNewSession(input);
          await session.fetchAndSetClaim(AppUserIdClaim, input.userContext);
          return session;
        },
      }),
    },
  });
}
