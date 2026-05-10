// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const environment = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? 'development';
const isProduction = environment === 'production';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment,
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  integrations: [Sentry.replayIntegration()],
  tracesSampleRate: isProduction ? 0.1 : 1,
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  // PII 마스킹 필터(beforeSend)는 다음 커밋에서 추가 — 추가 전까지는 production에서 비활성
  sendDefaultPii: !isProduction,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
