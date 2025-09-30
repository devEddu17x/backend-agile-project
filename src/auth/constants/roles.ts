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

export enum ROLE_NAMES {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  SELLER = 'seller',
}

// format: ACTION:RESOURCE
export const ROLES: Record<string, string[]> = {
  [ROLE_NAMES.CUSTOMER]: [`${ACTION.READ}:${RESOURCE.CLOTHES}`],
  [ROLE_NAMES.ADMIN]: [
    `${ACTION.CREATE}:${RESOURCE.CLOTHES}`,
    `${ACTION.READ}:${RESOURCE.CLOTHES}`,
  ],
  [ROLE_NAMES.SELLER]: [`${ACTION.READ}:${RESOURCE.CLOTHES}`],
};
