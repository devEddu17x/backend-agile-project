import EmailPassword from 'supertokens-node/recipe/emailpassword';
import { EmployeeService } from 'src/employee/employee.service';
import SuperTokens from 'supertokens-node';
import { BadRequestException } from '@nestjs/common';
import UserMetadata from 'supertokens-node/recipe/usermetadata';
import { APP_USER_ID_METADATA_KEY } from '../constants/app-user-id-key';

export function buildEmailPasswordRecipe(dependencies: {
  employeeService: EmployeeService;
}) {
  const { employeeService } = dependencies;

  return EmailPassword.init({
    override: {
      functions: (orig) => ({
        ...orig,
        async signUp(input) {
          const [res, appUser] = await Promise.all([
            orig.signUp(input),
            employeeService.createEmployee({
              email: input.email,
            }),
          ]);

          if (!appUser && res.status === 'OK') {
            SuperTokens.deleteUser(res.user.id);
            throw new BadRequestException('Could not create user');
          }

          if (appUser && res.status !== 'OK') {
            await employeeService.deleteEmployee(appUser.id);
          }

          if (res.status === 'OK' && appUser) {
            await UserMetadata.updateUserMetadata(res.user.id, {
              [APP_USER_ID_METADATA_KEY]: appUser.id,
            });
          }
          return res;
        },
      }),
    },
  });
}
