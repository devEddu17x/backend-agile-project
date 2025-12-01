// test/setup-tests.ts
import SuperTokens from 'supertokens-node';

beforeAll(() => {
  // Configuración de SuperTokens para tests
  SuperTokens.init({
    framework: 'express',
    supertokens: {
      connectionURI:
        process.env.SUPERTOKENS_CONNECTION_URI || 'http://localhost:3567',
    },
    appInfo: {
      appName: 'test-app',
      apiDomain: 'http://localhost:3001',
      websiteDomain: 'http://localhost:3000',
    },
    recipeList: [],
  });
});

afterAll(async () => {
  // Cleanup
});
