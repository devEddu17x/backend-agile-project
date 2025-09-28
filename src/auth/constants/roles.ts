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

// format: ACTION:RESOURCE
export const ROLE_DEFS: Record<string, string[]> = {
  user: [
    `${ACTION.READ}:${RESOURCE.SELF}`,
    `${ACTION.UPDATE}:${RESOURCE.SELF}`,
  ],
  admin: [
    `${ACTION.CREATE}:${RESOURCE.CLOTHES}`,
    `${ACTION.READ}:${RESOURCE.CLOTHES}`,
  ],
  seller: [`${ACTION.READ}:${RESOURCE.CLOTHES}`],
};
