/** HTML 태그를 제거하고 plain text로 변환 */
export function stripHtml(html: string): string {
  return html
    .replace(/<(script|style)[^>]*>([\s\S]*?)<\/\1>/gi, (_, _tag, content) =>
      content.replace(/</g, '&lt;').replace(/>/g, '&gt;'),
    )
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|h[1-6]|li|div|blockquote|td|th|tr)>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;|&#39;/gi, "'")
    .replace(/&#(\d+);/g, (match, dec) => {
      const n = Number(dec);
      return n >= 0 && n <= 0x10ffff ? String.fromCodePoint(n) : match;
    })
    .replace(/&#x([0-9a-f]+);/gi, (match, hex) => {
      const n = parseInt(hex, 16);
      return n >= 0 && n <= 0x10ffff ? String.fromCodePoint(n) : match;
    })
    .replace(/&amp;/gi, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
