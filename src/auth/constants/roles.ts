enum ACTION {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
}

enum RESOURCE {
  CLOTHES = 'clothes',
  EMPLOYEES = 'employees',
  SELF = 'self',
}

export enum ROLES {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  SELLER = 'seller',
}

// format: ACTION:RESOURCE
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [ROLES.CUSTOMER]: [`${ACTION.READ}:${RESOURCE.CLOTHES}`],
  [ROLES.ADMIN]: [
    `${ACTION.CREATE}:${RESOURCE.CLOTHES}`,
    `${ACTION.READ}:${RESOURCE.CLOTHES}`,
  ],
  [ROLES.SELLER]: [`${ACTION.READ}:${RESOURCE.CLOTHES}`],
};
