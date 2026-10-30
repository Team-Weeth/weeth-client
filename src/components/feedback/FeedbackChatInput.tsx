'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import SendIcon from '@/assets/icons/send.svg';
import { Icon } from '@/components/ui/Icon';
import { Textarea } from '@/components/ui/Textarea';
import { FEEDBACK_CHAT_INPUT_PLACEHOLDER, FEEDBACK_CONTENT_MAX_LENGTH } from '@/constants/feedback';
import { cn } from '@/lib/cn';

// 일부 브라우저는 IME 조합 중 keydown의 isComposing 대신 keyCode 229만 넘긴다.
const IME_PROCESS_KEY_CODE = 229;

interface FeedbackChatInputProps {
  onSend: (content: string) => void;
  className?: string;
}

function FeedbackChatInput({ onSend, className }: FeedbackChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = value.trim().length > 0;

  // 패널이 열릴 때 마운트되므로 바로 입력할 수 있게 포커스를 옮긴다.
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const submit = () => {
    if (!canSend) return;
    onSend(value);
    setValue('');
    textareaRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey) return;
    // 한글 조합 중 Enter는 글자 확정용이므로 전송하지 않는다.
    if (event.nativeEvent.isComposing || event.keyCode === IME_PROCESS_KEY_CODE) return;
    event.preventDefault();
    submit();
  };

  return (
    <div
      className={cn(
        'bg-container-neutral-alternative flex items-end gap-200 rounded-lg p-200',
        className,
      )}
    >
      <Textarea
        ref={textareaRef}
        aria-label="서비스 피드백 입력"
        placeholder={FEEDBACK_CHAT_INPUT_PLACEHOLDER}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        maxLength={FEEDBACK_CONTENT_MAX_LENGTH}
        rows={1}
        autoGrow
        className="typo-body1 max-h-[120px] rounded-lg px-300 py-200"
      />
      <button
        type="button"
        aria-label="보내기"
        disabled={!canSend}
        onClick={submit}
        className="bg-button-neutral enabled:hover:bg-button-neutral-interaction text-icon-normal disabled:text-icon-disabled flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-sm transition-colors disabled:cursor-not-allowed"
      >
        <Icon src={SendIcon} size={24} />
      </button>
    </div>
  );
}

export { FeedbackChatInput, type FeedbackChatInputProps };
