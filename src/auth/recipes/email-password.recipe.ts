import EmailPassword from 'supertokens-node/recipe/emailpassword';
import { EmployeeService } from 'src/employee/employee.service';
import SuperTokens from 'supertokens-node';
import { BadRequestException } from '@nestjs/common';
import UserMetadata from 'supertokens-node/recipe/usermetadata';
import { APP_USER_ID_METADATA_KEY } from '../constants/app-user-id-key';
import { EmployeeEntity } from 'src/employee/entities/employee.entitiy';

export function buildEmailPasswordRecipe(dependencies: {
  employeeService: EmployeeService;
}) {
  const { employeeService } = dependencies;

  return EmailPassword.init({
    override: {
      functions: (orig) => ({
        ...orig,
        async signUp(input) {
          const res = await orig.signUp(input);
          if (res.status !== 'OK') {
            return res;
          }

          let appUser: EmployeeEntity | null = null;
          try {
            appUser = await employeeService.createEmployee({
              email: input.email,
            });
          } catch (error) {
            SuperTokens.deleteUser(res.user.id);
            throw error;
          }

          if (!appUser) {
            await SuperTokens.deleteUser(res.user.id);
            throw new BadRequestException('Could not create user');
          }

          try {
            await UserMetadata.updateUserMetadata(res.user.id, {
              [APP_USER_ID_METADATA_KEY]: appUser.id,
            });
          } catch (error) {
            await employeeService.deleteEmployee(appUser.id);
            await SuperTokens.deleteUser(res.user.id);
            throw error;
          }

          return res;
        },
      }),
    },
  });
}
