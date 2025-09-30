import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SuperTokensModule } from 'supertokens-nestjs';
import UserRoles from 'supertokens-node/recipe/userroles';
import { buildEmailPasswordRecipe } from './recipes/email-password.recipe';
import { buildSessionRecipe } from './recipes/session.recipe';
import UserMetadata from 'supertokens-node/recipe/usermetadata';

@Module({
  imports: [
    SuperTokensModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('supertokens'),
        recipeList: [
          buildEmailPasswordRecipe(),
          buildSessionRecipe({ config: configService }),
          UserRoles.init(),
          UserMetadata.init(),
        ],
      }),
    }),
  ],
})
export class AuthModule {}
