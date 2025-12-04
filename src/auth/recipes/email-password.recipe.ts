import EmailPassword from 'supertokens-node/recipe/emailpassword';
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
