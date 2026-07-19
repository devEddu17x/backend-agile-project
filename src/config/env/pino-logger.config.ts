import { registerAs } from '@nestjs/config';
import { Params } from 'nestjs-pino';
import type { LoggerOptions } from 'pino';

export const pinoLoggerConfig = registerAs('pino-logger', (): Params => {
  const {
    NODE_ENV,
    LOKI_HOST = 'http://localhost:3100',
    ENABLE_LOKI = 'true', // Enable Loki by default
  } = process.env;
  const isDevelopment = NODE_ENV !== 'production';
  const shouldUseLoki = ENABLE_LOKI === 'true';
  console.log(
    `Pino Logger Config - Environment: ${NODE_ENV}, Use Loki: ${shouldUseLoki}, isDevelopment: ${isDevelopment}`,
  );
  // Base configuration for Pino HTTP
  const baseConfig: Params = {
    pinoHttp: {
      level: isDevelopment ? 'debug' : 'info',
      autoLogging: true,
      quietReqLogger: true,
      customProps: (req: any) => ({
        context: 'HTTP',
        userAgent: req.headers['user-agent'],
        endpoint: `${req.method} ${req.url}`,
      }),
      customSuccessMessage: (req: any, res: any) => {
        return `${req.method} ${req.url} completed with ${res.statusCode}`;
      },
      customErrorMessage: (req: any, res: any, error: any) => {
        return `${req.method} ${req.url} failed with ${res.statusCode}: ${error.message}`;
      },
      serializers: {
        req(req: any) {
          return {
            id: req.id,
            method: req.method,
            url: req.url,
            path: req.url?.split('?')[0],
            query: req.query,
            params: req.params,
            remoteAddress: req.remoteAddress,
            remotePort: req.remotePort,
            userAgent: req.headers['user-agent'],
            // Body is NOT logged here for security reasons (passwords, tokens, etc.)
            // Log body manually in controllers for specific safe endpoints only
          };
        },
        res(res: any) {
          return {
            statusCode: res.statusCode,
          };
        },
        err(error: any) {
          return {
            type: error.type,
            message: error.message,
            stack: error.stack,
          };
        },
      },
    } as LoggerOptions,
  };

  // Configure transports based on environment and if Loki is enabled
  const targets: any[] = [];

  // In development: add pino-pretty for readable logs
  if (isDevelopment) {
    targets.push({
      level: 'debug',
      target: 'pino-pretty',
      options: {
        colorize: true,
        singleLine: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    });
  } else {
    // In production: stdout
    targets.push({
      level: 'info',
      target: 'pino/file',
      options: {
        destination: 1, // stdout
      },
    });
  }

  // Add Loki if enabled
  if (shouldUseLoki) {
    targets.push({
      level: isDevelopment ? 'debug' : 'info',
      target: 'pino-loki',
      options: {
        batching: true,
        interval: 5,
        host: LOKI_HOST,
        labels: {
          application: 'backend-agile-project',
          environment: NODE_ENV || 'development',
        },
        basicAuth: {
          username: process.env.LOKI_USERNAME || '',
          password: process.env.LOKI_PASSWORD || '',
        },
      },
    });
  }

  // Apply transport configuration
  if (targets.length > 1) {
    (baseConfig.pinoHttp as any).transport = { targets };
  } else if (targets.length === 1) {
    (baseConfig.pinoHttp as any).transport = targets[0];
  }

  return baseConfig;
});

export default pinoLoggerConfig;
