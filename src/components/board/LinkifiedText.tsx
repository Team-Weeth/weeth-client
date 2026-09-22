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
      {parts.map((part, i) => {
        const isLink = i % 2 === 1;
        return isLink ? (
          <a
            key={`link-${i}`}
            href={normalizeHref(part)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn('text-brand-secondary break-all underline')}
          >
            {part}
          </a>
        ) : (
          <span key={`text-${i}`}>{part}</span>
        );
      })}
    </p>
  );
}

export { LinkifiedText, type LinkifiedTextProps };
