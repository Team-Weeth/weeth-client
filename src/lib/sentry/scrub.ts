import type { Breadcrumb, ErrorEvent } from '@sentry/nextjs';

const REDACTED = '[Filtered]';

const SENSITIVE_KEY_PATTERNS = [
  'accesstoken',
  'refreshtoken',
  'authcode',
  'authorization',
  'cookie',
  'setcookie',
  'password',
  'secret',
  'apikey',
];

const SENSITIVE_QUERY_PARAMS = ['code', 'token', 'access_token', 'refresh_token', 'authCode'];

function isSensitiveKey(key: string): boolean {
  const normalized = key.toLowerCase().replace(/[-_\s]/g, '');
  return SENSITIVE_KEY_PATTERNS.some((pattern) => normalized.includes(pattern));
}

function scrubValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(scrubValue);
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      out[key] = isSensitiveKey(key) ? REDACTED : scrubValue(val);
    }
    return out;
  }
  return value;
}

function scrubUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  try {
    const isAbsolute = /^https?:\/\//.test(url);
    const parsed = new URL(url, isAbsolute ? undefined : 'http://placeholder');
    let changed = false;
    for (const param of SENSITIVE_QUERY_PARAMS) {
      if (parsed.searchParams.has(param)) {
        parsed.searchParams.set(param, REDACTED);
        changed = true;
      }
    }
    if (!changed) return url;
    return isAbsolute ? parsed.toString() : `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return url;
  }
}

export function scrubSentryEvent(event: ErrorEvent): ErrorEvent {
  if (event.request) {
    if (event.request.url) {
      event.request.url = scrubUrl(event.request.url) ?? event.request.url;
    }
    if (event.request.cookies) {
      event.request.cookies = { _filtered: REDACTED };
    }
    if (event.request.headers) {
      event.request.headers = scrubValue(event.request.headers) as Record<string, string>;
    }
    if (event.request.data !== undefined) {
      event.request.data = scrubValue(event.request.data);
    }
  }
  if (event.extra) {
    event.extra = scrubValue(event.extra) as Record<string, unknown>;
  }
  if (event.contexts) {
    event.contexts = scrubValue(event.contexts) as ErrorEvent['contexts'];
  }
  return event;
}

export function scrubSentryBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb {
  if (breadcrumb.data) {
    const data: Record<string, unknown> = { ...breadcrumb.data };
    if (typeof data.url === 'string') {
      data.url = scrubUrl(data.url);
    }
    if (typeof data.to === 'string') {
      data.to = scrubUrl(data.to);
    }
    if (typeof data.from === 'string') {
      data.from = scrubUrl(data.from);
    }
    breadcrumb.data = scrubValue(data) as Record<string, unknown>;
  }
  return breadcrumb;
}
