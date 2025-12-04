import EmailPassword from 'supertokens-node/recipe/emailpassword';
import SuperTokens from 'supertokens-node';
import UserRoles from 'supertokens-node/recipe/userroles';
import { ROLES } from '../constants/roles';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Template } from '../enums/email.template';
import { renderTemplate } from '../helpers/mail.template';
export function buildEmailPasswordRecipe(dependencies: {
  config: ConfigService;
}) {
  const emailConfig = dependencies.config.get('email');
  const appInfo = dependencies.config.get('supertokens.appInfo');
  const transporter = nodemailer.createTransport(emailConfig.smtp);

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
              ROLES.CUSTOMER,
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
    emailDelivery: {
      override: (orig) => ({
        ...orig,
        sendEmail: async (context) => {
          let from = '';
          if (context.type === 'PASSWORD_RESET') {
            from = `${appInfo.appName} <reset-password@${emailConfig.from}>`;
            const passwordResetLink = context.passwordResetLink;
            const toEmail = context.user.email;
            await transporter.sendMail({
              from: from,
              to: toEmail,
              subject: 'Reset password link',
              html: await renderTemplate(Template.PASSWORD_RESET, {
                passwordResetLink: passwordResetLink,
                currentYear: new Date().getFullYear().toString(),
              }),
            });
          } else {
            return orig.sendEmail(context);
          }
        },
      }),
    },
  });
}
