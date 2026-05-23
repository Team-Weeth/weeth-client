// protocol이 없는 href를 https://로 정규화
function normalizeHref(href: string): string {
  if (!href) return href;
  if (/^[a-z][a-z\d+\-.]*:/i.test(href)) return href;
  if (href.startsWith('//') || href.startsWith('#')) return href;
  return `https://${href}`;
}

export { normalizeHref };
