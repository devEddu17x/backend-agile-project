import SuperTokens from 'supertokens-node';
import UserRoles from 'supertokens-node/recipe/userroles';
import EmailPassword from 'supertokens-node/recipe/emailpassword';
import Session from 'supertokens-node/recipe/session';
import { DataSource } from 'typeorm';
import { ROLE_NAMES, ROLES } from '../src/auth/constants/roles';
import { EmployeeEntity } from '../src/employee/entities/employee.entitiy';

import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Database connection configuration
const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;
// Seed users credentials
const { EMAIL_ADMIN, EMAIL_EMPLOYEE, ADMIN_PASSWORD, EMPLOYEE_PASSWORD } =
  process.env;
// SuperTokens configuration
const { CONNECTION_URI, APP_NAME, API_DOMAIN, WEBSITE_DOMAIN } = process.env;

console.log('Starting RBAC seeder...');

const DumiDataSource = new DataSource({
  type: 'postgres',
  host: DB_HOST || 'localhost',
  port: DB_PORT ? parseInt(DB_PORT) : 5432,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  entities: [EmployeeEntity],
  synchronize: true,
  logging: true,
});

async function main() {
  SuperTokens.init({
    framework: 'express',
    supertokens: { connectionURI: CONNECTION_URI || 'http://localhost:3567' },
    appInfo: {
      appName: APP_NAME || 'DUMI',
      apiDomain: API_DOMAIN || 'http://localhost:3000',
      websiteDomain: WEBSITE_DOMAIN || 'http://localhost:3001',
    },
    recipeList: [EmailPassword.init(), Session.init(), UserRoles.init()],
  });

  try {
    await DumiDataSource.initialize();
    console.log('Data Source has been initialized!');
  } catch (error) {
    console.error('Error initializing data source:', error);
    process.exit(1);
  }
  try {
    await Promise.all(
      Object.entries(ROLES).map(([role, perms]) =>
        UserRoles.createNewRoleOrAddPermissions(role, perms),
      ),
    );
    console.log('Roles and permissions seeded successfully');
  } catch (error) {
    console.error('Error seeding roles and permissions:', error);
    process.exit(1);
  }

  try {
    const signUpSeedUserResponse = await Promise.all([
      EmailPassword.signUp('public', EMAIL_ADMIN, ADMIN_PASSWORD),
      EmailPassword.signUp('public', EMAIL_EMPLOYEE, EMPLOYEE_PASSWORD),
    ]);

    if (
      signUpSeedUserResponse.some(
        (res) => res.status === 'EMAIL_ALREADY_EXISTS_ERROR',
      )
    ) {
      throw new Error(
        'User(s) already exists, seed script should be run only once',
      );
    }

    for (const res of signUpSeedUserResponse) {
      if (res.status === 'OK') {
        const userId = res.user.id;
        if (!userId) throw new Error('No user id returned by SuperTokens');

        const user = DumiDataSource.getRepository(EmployeeEntity).create({
          names: 'Seed User',
          lastNames: 'Last Name',
          email: res.user.emails[0],
        });
        await Promise.all([
          await DumiDataSource.getRepository(EmployeeEntity).save(user),
          await UserRoles.addRoleToUser(
            'public',
            userId,
            user.email === EMAIL_ADMIN ? ROLE_NAMES.ADMIN : ROLE_NAMES.USER,
          ),
        ]);
      }
    }

    console.log('Default users created successfully');
  } catch (e) {
    console.error('Error creating default users:', e);
    process.exit(1);
  }

  console.log('RBAC seeded OK');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
