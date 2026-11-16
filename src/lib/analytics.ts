import posthog from 'posthog-js';

/** First custom PostHog event producer in this repo — posthog.init() runs in instrumentation-client.ts. */
function trackEvent(name: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  if (!posthog.__loaded) return;
  posthog.capture(name, properties);
}

export { trackEvent };
