// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import { scrubSentryBreadcrumb, scrubSentryEvent } from '@/lib/sentry/scrub';

const branch = process.env.AWS_BRANCH;
const environment =
  branch === 'main' ? 'production' : branch === 'develop' ? 'staging' : 'development';
const isProduction = environment === 'production';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment,
  release: process.env.AWS_COMMIT_ID,
  tracesSampleRate: isProduction ? 0.1 : 1,
  enableLogs: true,
  sendDefaultPii: true,
  beforeSend: scrubSentryEvent,
  beforeBreadcrumb: scrubSentryBreadcrumb,
});
