import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmployeeModule } from 'src/employee/employee.module';
import { EmployeeService } from 'src/employee/employee.service';
import { SuperTokensModule } from 'supertokens-nestjs';
import EmailPassword from 'supertokens-node/recipe/emailpassword';
import Session from 'supertokens-node/recipe/session';
import UserRoles from 'supertokens-node/recipe/userroles';
@Module({
  imports: [
    SuperTokensModule.forRootAsync({
      imports: [EmployeeModule],
      inject: [ConfigService, EmployeeService],
      useFactory: (
        configService: ConfigService,
        employeeService: EmployeeService,
      ) => ({
        ...configService.get('supertokens'),
        recipeList: [
          EmailPassword.init({
            override: {
              functions: (orig) => ({
                ...orig,
                signUp: async (input) => {
                  const res = await orig.signUp(input);
                  if (res.status === 'OK') {
                    await employeeService.createEmployee({
                      email: res.user.emails[0],
                    });
                  }
                  // TODO!:delete user if could not create employee
                  return res;
                },
              }),
            },
          }),
          Session.init({
            getTokenTransferMethod: () => 'cookie',
            cookieDomain: 'localhost',
            cookieSameSite: 'lax',
            cookieSecure: false,
          }),
          UserRoles.init(),
        ],
      }),
    }),
  ],
})
export class AuthModule {}
