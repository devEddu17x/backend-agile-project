import { SessionContainer } from 'supertokens-node/recipe/session';
import UserRoles from 'supertokens-node/recipe/userroles';
import { ROLES } from '../constants/roles';

export interface ClothesFilterOptions {
  isInEcommerce?: boolean;
  isDraft?: boolean;
}

/**
 * Helper class to determine the user's context and permissions
 * Encapsulates role-checking logic to keep controllers clean
 */
export class UserContext {
  private roles: string[] = [];
  private rolesLoaded = false;

  constructor(private session?: SessionContainer) {}

  private async loadRoles(): Promise<void> {
    if (this.rolesLoaded || !this.session) {
      return;
    }

    try {
      const userRoles = await this.session.getClaimValue(
        UserRoles.UserRoleClaim,
      );
      this.roles = Array.isArray(userRoles) ? userRoles : [];
      this.rolesLoaded = true;
    } catch (error) {
      this.roles = [];
      this.rolesLoaded = true;
    }
  }

  isAuthenticated(): boolean {
    return !!this.session;
  }

  async hasRole(...rolesToCheck: string[]): Promise<boolean> {
    await this.loadRoles();
    return rolesToCheck.some((role) => this.roles.includes(role));
  }

  async isEmployee(): Promise<boolean> {
    return this.hasRole(ROLES.ADMIN, ROLES.SELLER);
  }

  async isCustomer(): Promise<boolean> {
    return this.hasRole(ROLES.CUSTOMER);
  }

  async isAdmin(): Promise<boolean> {
    return this.hasRole(ROLES.ADMIN);
  }

  /**
   * Returns the appropriate filter options for clothes queries
   * based on the user's context.
   *
   * - Employees (Admin/Seller): see all items (no filters)
   * - Customers and public: see only active e-commerce items
   */
  async getClothesFilterOptions(): Promise<ClothesFilterOptions> {
    if (await this.isEmployee()) {
      return {};
    }

    return {
      isInEcommerce: true,
      isDraft: false,
    };
  }
}
