import { registerAs } from '@nestjs/config';

export default registerAs('pino-logger', () => {
  const { NODE_ENV } = process.env;
  if (NODE_ENV === 'production') {
    return {};
  }
  return {
    pinoHttp: {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          singleLine: true,
          translateTime: 'HH:MM:ss',
          ignore: ',req.headers,res.headers',
        },
      },
    },
  };
});
