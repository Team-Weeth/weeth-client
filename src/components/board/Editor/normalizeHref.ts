const ALLOWED_SCHEMES = /^(https?|mailto|tel):/i;

// protocol이 없는 href를 https://로 정규화하고, 허용된 스킴만 통과
function normalizeHref(href: string): string {
  if (!href) return href;
  if (/^[a-z][a-z\d+\-.]*:/i.test(href)) {
    return ALLOWED_SCHEMES.test(href) ? href : '';
  }
  if (href.startsWith('//') || href.startsWith('#')) return href;
  return `https://${href}`;
}

export { normalizeHref };
