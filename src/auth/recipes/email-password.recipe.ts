import EmailPassword from 'supertokens-node/recipe/emailpassword';
import { EmployeeService } from 'src/employee/employee.service';
import SuperTokens from 'supertokens-node';
import { BadRequestException } from '@nestjs/common';

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
          let appUser = null;
          if (res.status === 'OK') {
            appUser = await employeeService.createEmployee({
              email: res.user.emails[0],
            });
            if (!appUser) {
              await SuperTokens.deleteUser(res.user.id);
              throw new BadRequestException('Could not create user');
            }
            await SuperTokens.createUserIdMapping({
              superTokensUserId: res.user.id,
              externalUserId: appUser.id,
            });
          }
          return res;
        },
      }),
    },
  });
}
