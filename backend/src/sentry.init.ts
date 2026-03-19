import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

const dsn = process.env['SENTRY_DSN'];
const env = process.env['NODE_ENV'] ?? 'development';
const isProduction = env === 'production';

if (dsn) {
  Sentry.init({
    dsn,
    environment: env,
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: isProduction ? 0.1 : 1.0,
    profilesSampleRate: isProduction ? 0.1 : 1.0,
  });
}
