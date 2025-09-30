import EmailPassword from 'supertokens-node/recipe/emailpassword';
import SuperTokens from 'supertokens-node';
import UserRoles from 'supertokens-node/recipe/userroles';
import { ROLE_NAMES } from '../constants/roles';

export function buildEmailPasswordRecipe() {
  return EmailPassword.init({
    override: {
      functions: (orig) => ({
        ...orig,
        async signUp(input) {
          const res = await orig.signUp(input);
          if (res.status !== 'OK') {
            return res;
          }

          // let appUser: EmployeeEntity | null = null;
          try {
            //
            // appUser = await employeeService.createEmployee({
            //   email: input.email,
            // });
            //
            await UserRoles.addRoleToUser(
              'public',
              res.user.id,
              ROLE_NAMES.CUSTOMER,
            );
          } catch (error) {
            SuperTokens.deleteUser(res.user.id);
            throw error;
          }
          //
          // if (!appUser) {
          //   await SuperTokens.deleteUser(res.user.id);
          //   throw new BadRequestException('Could not create user');
          // }
          //
          // try {
          //   await UserMetadata.updateUserMetadata(res.user.id, {
          //     [APP_USER_ID_METADATA_KEY]: appUser.id,
          //   });
          // } catch (error) {
          //   await employeeService.deleteEmployee(appUser.id);
          //   await SuperTokens.deleteUser(res.user.id);
          //   throw error;
          // }

          return res;
        },
      }),
    },
  });
}
