import EmailPassword from 'supertokens-node/recipe/emailpassword';
import { EmployeeService } from 'src/employee/employee.service';

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
          if (res.status === 'OK') {
            await employeeService.createEmployee({
              email: res.user.emails[0],
            });
          }
          // TODO: si falla createEmployee, revertir creando un cleanup del user en SuperTokens
          return res;
        },
      }),
    },
  });
}
