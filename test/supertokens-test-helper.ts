// test/supertokens-test-helper.ts
import * as request from 'supertest';
import UserRoles from 'supertokens-node/recipe/userroles';
import SuperTokens from 'supertokens-node';

export async function loginAndGetSession(
  app: any,
  email: string,
  password: string,
) {
  const response = await request(app.getHttpServer())
    .post('/api/v1/auth/signin')
    .send({
      formFields: [
        { id: 'email', value: email },
        { id: 'password', value: password },
      ],
    });

  // SuperTokens devuelve las cookies en el header
  const cookies = response.headers['set-cookie'];
  const cookiesArray = Array.isArray(cookies)
    ? cookies
    : cookies
      ? [cookies]
      : [];

  return {
    cookies,
    accessToken: extractToken(cookiesArray, 'sAccessToken'),
    refreshToken: extractToken(cookiesArray, 'sRefreshToken'),
    userId: response.body.user?.id,
  };
}

export async function assignRoleToUser(
  email: string,
  role: string,
): Promise<void> {
  // Get user by email
  const userResponse = await SuperTokens.listUsersByAccountInfo('public', {
    email,
  });

  if (userResponse.length === 0) {
    console.error(`❌ User with email ${email} not found in SuperTokens`);
    throw new Error(`User with email ${email} not found`);
  }

  console.log(`✅ Found user ${email} with ID: ${userResponse[0].id}`);

  // Assign role
  await UserRoles.addRoleToUser('public', userResponse[0].id, role);
  console.log(`✅ Assigned role '${role}' to user ${email}`);
}

export async function signupUser(
  app: any,
  email: string,
  password: string,
): Promise<request.Response> {
  return request(app.getHttpServer())
    .post('/api/v1/auth/signup')
    .send({
      formFields: [
        { id: 'email', value: email },
        { id: 'password', value: password },
      ],
    });
}

/**
 * Helper completo: registra usuario, asigna rol, y hace login
 */
export async function createUserWithRole(
  app: any,
  email: string,
  password: string,
  role: string,
): Promise<{ cookies: string[]; antiCsrfToken: string }> {
  // 1. Signup
  const signupResponse = await signupUser(app, email, password);

  if (signupResponse.status !== 200) {
    console.error(
      `❌ Signup failed for ${email}:`,
      signupResponse.status,
      signupResponse.body,
    );
    throw new Error(`Signup failed for ${email}: ${signupResponse.status}`);
  }

  console.log(`✅ User ${email} signed up successfully`);

  // 2. Asignar rol (esperar un poco para que SuperTokens procese el usuario)
  await new Promise((resolve) => setTimeout(resolve, 100));
  await assignRoleToUser(email, role);

  // 3. Login
  const loginResponse = await request(app.getHttpServer())
    .post('/api/v1/auth/signin')
    .send({
      formFields: [
        { id: 'email', value: email },
        { id: 'password', value: password },
      ],
    });

  if (loginResponse.status !== 200) {
    console.error(`❌ Login failed for ${email}:`, loginResponse.status);
    throw new Error(`Login failed for ${email}`);
  }

  const cookies = loginResponse.headers['set-cookie'] as unknown as string[];
  const antiCsrfToken = extractAntiCsrfToken(cookies);

  console.log(`✅ User ${email} logged in successfully`);

  return { cookies, antiCsrfToken };
}

function extractToken(cookies: string[], tokenName: string): string | null {
  if (!cookies) return null;

  const cookie = cookies.find((c) => c.startsWith(tokenName));
  if (!cookie) return null;

  const match = cookie.match(/=([^;]+)/);
  return match ? match[1] : null;
}

function extractAntiCsrfToken(cookies: string[]): string {
  if (!cookies) {
    console.log('⚠️  No cookies received');
    return '';
  }

  // El token anti-CSRF viene en el sFrontToken cookie
  const frontTokenCookie = cookies.find((c) => c.startsWith('sFrontToken='));
  if (!frontTokenCookie) {
    console.log('⚠️  No sFrontToken cookie found');
    console.log(
      'Available cookies:',
      cookies.map((c) => c.split('=')[0]),
    );
    return '';
  }

  try {
    const tokenMatch = frontTokenCookie.match(/sFrontToken=([^;]+)/);
    if (!tokenMatch) {
      console.log('⚠️  Could not match sFrontToken value');
      return '';
    }

    const frontToken = decodeURIComponent(tokenMatch[1]);
    console.log('📦 Decoded frontToken:', frontToken);
    const parsed = JSON.parse(frontToken);
    console.log('✅ Parsed frontToken, antiCsrf:', parsed.antiCsrf);
    return parsed.antiCsrf || '';
  } catch (error) {
    console.error('❌ Error extracting anti-CSRF token:', error);
    console.error('frontTokenCookie:', frontTokenCookie);
    return '';
  }
}
