import { registerAs } from '@nestjs/config';

export default registerAs('supertokens', () => {
    // api key will be used later
    const { CONNECTION_URI, APP_NAME, API_DOMAIN, WEBSITE_DOMAIN, API_KEY } = process.env;
    return {
        framework: 'express',
        supertokens: {
            connectionURI: CONNECTION_URI,
        },
        appInfo: {
            appName: APP_NAME,
            apiDomain: API_DOMAIN,
            websiteDomain: WEBSITE_DOMAIN,
        }
    };
});