import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmployeeModule } from 'src/employee/employee.module';
import { EmployeeService } from 'src/employee/employee.service';
import { SuperTokensModule } from 'supertokens-nestjs';
import UserRoles from 'supertokens-node/recipe/userroles';
import { buildEmailPasswordRecipe } from './recipes/email-password.recipe';
import { buildSessionRecipe } from './recipes/session.recipe';
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
          buildEmailPasswordRecipe({ employeeService }),
          buildSessionRecipe({ config: configService }),
          UserRoles.init(),
        ],
      }),
    }),
  ],
})
export class AuthModule {}
