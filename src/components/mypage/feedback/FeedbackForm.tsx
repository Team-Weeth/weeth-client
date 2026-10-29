'use client';

import { useState } from 'react';
import { isAxiosError } from 'axios';
import { CharacterCountRow } from '@/components/mypage/CharacterCountRow';
import { FeedbackBanner } from '@/components/mypage/feedback/FeedbackBanner';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { FEEDBACK_CONTENT_MAX_LENGTH } from '@/constants/feedback';
import { useCreateFeedbackMutation } from '@/hooks/mutations/useCreateFeedbackMutation';
import { cn } from '@/lib/cn';
import { toastError } from '@/stores/useToastStore';
import { getApiErrorMessage } from '@/utils/shared/getApiErrorCode';
import type { CreateFeedbackRequest } from '@/types/feedback';

/** 이미지 첨부 등 선택 입력이 추가되어도 이 객체와 buildFeedbackRequest만 확장하면 되도록 묶어 둔다. */
interface FeedbackFormValues {
  content: string;
}

const INITIAL_FEEDBACK_FORM_VALUES: FeedbackFormValues = { content: '' };

const FEEDBACK_SUBMIT_ERROR_MESSAGE = '피드백 전송에 실패했어요. 다시 시도해주세요.';

function buildFeedbackRequest(values: FeedbackFormValues): CreateFeedbackRequest {
  return { content: values.content, channel: 'FORM' };
}

// String.prototype.trim은 U+3000(전각 공백)·U+00A0 등 유니코드 공백도 제거해 서버의 공백 검증과 맞는다.
function isBlankContent(content: string) {
  return content.trim().length === 0;
}

function getFeedbackErrorMessage(error: unknown) {
  // @Valid 실패(bindException)는 message가 고정 문자열이고 실제 사유는 data[0].message에 담긴다.
  if (isAxiosError(error)) {
    const fieldErrors: unknown = error.response?.data?.data;
    if (Array.isArray(fieldErrors)) {
      const fieldMessage: unknown = fieldErrors[0]?.message;
      if (typeof fieldMessage === 'string' && fieldMessage) return fieldMessage;
    }
  }
  const message = getApiErrorMessage(error);
  return message && message !== 'bindException' ? message : FEEDBACK_SUBMIT_ERROR_MESSAGE;
}

interface FeedbackFormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  onSubmitted: () => void;
}

function FeedbackForm({ onSubmitted, className, ...props }: FeedbackFormProps) {
  const [values, setValues] = useState<FeedbackFormValues>(INITIAL_FEEDBACK_FORM_VALUES);
  const { mutate, isPending } = useCreateFeedbackMutation();
  const isSubmitDisabled = isBlankContent(values.content) || isPending;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitDisabled) return;
    // 제출 측정은 useCreateFeedbackMutation이 성공 시 남기므로 여기서 다시 호출하지 않는다.
    mutate(buildFeedbackRequest(values), {
      onSuccess: onSubmitted,
      onError: (error) => toastError(getFeedbackErrorMessage(error)),
    });
  };

  return (
    <form
      className={cn('flex flex-col gap-800', className)}
      onSubmit={handleSubmit}
      noValidate
      {...props}
    >
      <div className="flex flex-col gap-600">
        <FeedbackBanner />
        <div className="flex flex-col gap-200">
          <h2 className="typo-h3 text-text-strong">Weeth에 바라는 점이 있나요?</h2>
          <p className="typo-body1 tablet:typo-body2 text-text-normal whitespace-pre-line">
            {
              'Weeth를 사용하면서 아쉬웠던 점이나\n새롭게 필요한 기능이 있나요?\n남겨주시면 더 나은 Weeth를 만드는 데 참고할게요 :)'
            }
          </p>
        </div>
        <div className="flex flex-col gap-200">
          <Textarea
            aria-label="서비스 피드백 내용"
            placeholder="의견을 자유롭게 남겨주세요."
            value={values.content}
            onChange={(event) => setValues((prev) => ({ ...prev, content: event.target.value }))}
            maxLength={FEEDBACK_CONTENT_MAX_LENGTH}
            className="tablet:min-h-[175px] min-h-[328px] rounded-lg px-400 py-300"
          />
          <CharacterCountRow value={values.content} maxLength={FEEDBACK_CONTENT_MAX_LENGTH} />
        </div>
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitDisabled}>
        전송
      </Button>
    </form>
  );
}

export { FeedbackForm, type FeedbackFormProps, type FeedbackFormValues };
