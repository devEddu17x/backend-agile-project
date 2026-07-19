import { PrimitiveClaim } from 'supertokens-node/recipe/session/claims';
import UserMetadata from 'supertokens-node/recipe/usermetadata';
import { APP_USER_ID_METADATA_KEY } from '../constants/app-user-id-key';

export const AppUserIdClaim = new PrimitiveClaim<string>({
  key: APP_USER_ID_METADATA_KEY,
  async fetchValue(userId) {
    const result = await UserMetadata.getUserMetadata(userId);
    const value = result.metadata?.[APP_USER_ID_METADATA_KEY];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
    return undefined;
  },
});
