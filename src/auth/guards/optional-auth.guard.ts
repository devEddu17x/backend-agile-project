import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { getSession } from 'supertokens-node/recipe/session';

/**
 * Optional guard that allows public access but injects the session if it exists.
 * Unlike SuperTokensAuthGuard, this guard does NOT block unauthenticated users.
 *
 * Usage: For endpoints that should be public but want to behave differently
 * when the user is authenticated (e.g., e-commerce catalog).
 */
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      const session = await getSession(request, request.res, {
        sessionRequired: false,
      });

      request.session = session;
    } catch (error) {
      request.session = undefined;
    }

    return true;
  }
}
