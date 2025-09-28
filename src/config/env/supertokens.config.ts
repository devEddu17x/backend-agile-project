import { registerAs } from '@nestjs/config';

export default registerAs('supertokens', () => {
    const { CONNECTION_URI, APP_NAME, API_DOMAIN, WEBSITE_DOMAIN, API_KEY } = process.env;
    return {
        connectionUri: CONNECTION_URI,
        appName: APP_NAME,
        apiDomain: API_DOMAIN,
        websiteDomain: WEBSITE_DOMAIN,
        apiKey: API_KEY
    };
});