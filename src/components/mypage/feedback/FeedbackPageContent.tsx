'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BackIcon from '@/assets/icons/back.svg';
import { FeedbackComplete } from '@/components/mypage/feedback/FeedbackComplete';
import { FeedbackForm } from '@/components/mypage/feedback/FeedbackForm';
import { Icon } from '@/components/ui/Icon';
import { trackFeedbackOpened } from '@/lib/analytics/feedbackEvents';
import { cn } from '@/lib/cn';

type FeedbackPageContentProps = React.HTMLAttributes<HTMLDivElement>;

function FeedbackPageContent({ className, ...props }: FeedbackPageContentProps) {
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 클럽 스토어는 레이아웃 effect에서 하이드레이션되어 값이 바뀌며 중복 측정될 수 있어 라우트 값을 쓴다.
  useEffect(() => {
    trackFeedbackOpened({ variant: 'settings', clubId });
  }, [clubId]);

  return (
    <div className={cn('tablet:gap-4 flex min-w-0 flex-1 flex-col', className)} {...props}>
      {/* 모바일은 32px 버튼 안쪽 여백만큼 당겨서 꺾쇠를 본문 왼쪽 끝에 맞춘다 (Figma PageNavigation_v4). */}
      <div className="tablet:ml-0 tablet:gap-1 tablet:py-0 -ml-[10px] flex items-center py-300">
        <button
          type="button"
          onClick={() => router.push(`/${clubId}/mypage/settings`)}
          aria-label="서비스 설정으로 돌아가기"
          className="flex size-8 cursor-pointer items-center justify-center"
        >
          <Icon src={BackIcon} size={17} className="text-icon-normal" />
        </button>
        <h1 className="tablet:typo-h3 typo-sub1 text-text-normal">서비스 피드백</h1>
      </div>

      {/* 완료 화면에서 돌아오면 폼을 새로 마운트해 빈 상태로 시작한다. */}
      {isSubmitted ? (
        <FeedbackComplete onRewrite={() => setIsSubmitted(false)} />
      ) : (
        <FeedbackForm onSubmitted={() => setIsSubmitted(true)} />
      )}
    </div>
  );
}

export { FeedbackPageContent, type FeedbackPageContentProps };
