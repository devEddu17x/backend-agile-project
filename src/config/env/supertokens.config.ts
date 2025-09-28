import { registerAs } from '@nestjs/config';

export default registerAs('supertokens', () => {
  // api key will be used later
  const { CONNECTION_URI, APP_NAME, API_DOMAIN, WEBSITE_DOMAIN } =
    process.env;
  const missingVars = [
    ['CONNECTION_URI', CONNECTION_URI],
    ['APP_NAME', APP_NAME],
    ['API_DOMAIN', API_DOMAIN],
    ['WEBSITE_DOMAIN', WEBSITE_DOMAIN],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missingVars.length) {
    throw new Error(
      `Missing required SuperTokens env vars: ${missingVars.join(', ')}`,
    );
  }

  return {
    framework: 'express',
    supertokens: {
      connectionURI: CONNECTION_URI,
    },
    appInfo: {
      appName: APP_NAME,
      apiDomain: API_DOMAIN,
      websiteDomain: WEBSITE_DOMAIN,
    },
  };
});
