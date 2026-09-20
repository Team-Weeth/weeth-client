import { cn } from '@/lib/cn';
import { normalizeHref } from '@/components/board/Editor/normalizeHref';

/** http(s):// URL을 캡처 그룹으로 감싸 split 결과에 포함시킴 */
const URL_REGEX = /(https?:\/\/[^\s]+)/;

interface LinkifiedTextProps {
  text: string;
  className?: string;
}

function LinkifiedText({ text, className }: LinkifiedTextProps) {
  const parts = text.split(URL_REGEX);

  return (
    <p className={className}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <a
            key={i}
            href={normalizeHref(part)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn('text-brand-secondary break-all underline')}
          >
            {part}
          </a>
        ) : (
          part
        ),
      )}
    </p>
  );
}

export { LinkifiedText, type LinkifiedTextProps };
