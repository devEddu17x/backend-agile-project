import Session from 'supertokens-node/recipe/session';
import { ConfigService } from '@nestjs/config';
import { AppUserIdClaim } from '../claims/app-user-id.claim';

export function buildSessionRecipe(dependencies: { config: ConfigService }) {
  const { config } = dependencies;
  const cookieConfig = config.get('cookie');
  if (!cookieConfig) {
    throw new Error('Cookie configuration is missing');
  }
  return Session.init({
    getTokenTransferMethod: () => 'cookie',
    ...cookieConfig,
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
