import { useEffect, type RefObject } from 'react';
import { common, createLowlight } from 'lowlight';
import { toHtml } from 'hast-util-to-html';

const lowlight = createLowlight(common);

/**
 * 렌더링된 코드 블록에 syntax highlighting 적용
 */
function useCodeHighlight(ref: RefObject<HTMLElement | null>, content: string) {
  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const codeBlocks = container.querySelectorAll('pre code:not([data-highlighted])');
    codeBlocks.forEach((codeEl) => {
      const text = codeEl.textContent ?? '';
      if (!text.trim()) return;

      const lang = [...codeEl.classList]
        .find((cls) => cls.startsWith('language-'))
        ?.slice('language-'.length);

      const result =
        lang && lowlight.registered(lang)
          ? lowlight.highlight(lang, text)
          : lowlight.highlightAuto(text);

      codeEl.innerHTML = toHtml(result);
      codeEl.setAttribute('data-highlighted', '');
    });
  }, [ref, content]);
}

export { useCodeHighlight };
