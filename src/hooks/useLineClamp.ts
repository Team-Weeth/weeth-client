import { useEffect, useRef, useState } from 'react';

function useLineClamp<T extends HTMLElement>(enabled: boolean, content: string) {
  const ref = useRef<T>(null);
  const [isClamped, setIsClamped] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const check = () => {
      const prevDisplay = el.style.display;
      const prevClamp = el.style.webkitLineClamp;
      el.style.display = 'block';
      el.style.webkitLineClamp = 'unset';
      const fullHeight = el.scrollHeight;
      el.style.display = prevDisplay;
      el.style.webkitLineClamp = prevClamp;
      setIsClamped(fullHeight > el.clientHeight);
    };

    check();

    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [enabled, content]);

  return { ref, isClamped, isExpanded, setIsExpanded };
}

export { useLineClamp };
