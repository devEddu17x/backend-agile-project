import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import UserRoles from 'supertokens-node/recipe/userroles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const methodRoles =
      this.reflector.get<string[]>('roles', context.getHandler()) || [];
    const controllerRoles =
      this.reflector.get<string[]>('roles', context.getClass()) || [];

    const requiredRoles =
      methodRoles.length > 0 ? methodRoles : controllerRoles;

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const session = context.switchToHttp().getRequest().session;

    if (!session) {
      return false;
    }

    try {
      const userRoles = await session.getClaimValue(UserRoles.UserRoleClaim);

      if (!userRoles || !Array.isArray(userRoles)) {
        return false;
      }

      return this.matchRoles(requiredRoles, userRoles);
    } catch (error) {
      return false;
    }
  }

  private matchRoles(requiredRoles: string[], userRoles: string[]): boolean {
    if (userRoles.includes('admin')) {
      return true;
    }
    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
