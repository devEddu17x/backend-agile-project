import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SuperTokensModule } from 'supertokens-nestjs';
import EmailPassword from 'supertokens-node/recipe/emailpassword';
import Session from 'supertokens-node/recipe/session';
import UserRoles from 'supertokens-node/recipe/userroles';
@Module({
  imports: [
    SuperTokensModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('supertokens'),
        recipeList: [EmailPassword.init(), Session.init(), UserRoles.init()],
      }),
    }),
  ],
})
export class AuthModule { }
