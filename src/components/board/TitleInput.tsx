'use client';

import { cn } from '@/lib/cn';

const MAX_LENGTH = 100;

interface TitleInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  ref?: React.Ref<HTMLTextAreaElement>;
}

function TitleInput({ className, onKeyDown, onChange, ...props }: TitleInputProps) {
  const adjustHeight = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    adjustHeight(e.currentTarget);
    onChange?.(e);
  };

  // Enter 줄바꿈 차단
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
    }
    onKeyDown?.(e);
  };

  return (
    <div
      className={cn('flex items-center gap-200 self-stretch rounded-lg px-100 py-300', className)}
    >
      <textarea
        rows={1}
        maxLength={MAX_LENGTH}
        className="typo-h3 text-text-strong placeholder:text-text-alternative w-full resize-none overflow-hidden bg-transparent outline-none"
        placeholder="제목"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        {...props}
      />
    </div>
  );
}

export { TitleInput, type TitleInputProps };
