import { registerAs } from '@nestjs/config';

export default registerAs('api', () => {
  const { API_PREFIX } = process.env;

  return {
    prefix: API_PREFIX || 'api/v1',
  };
});
