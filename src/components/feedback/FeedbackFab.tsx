'use client';

import { useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import LogoInitialIcon from '@/assets/icons/logo/logo_initial_Origin.svg';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { Icon } from '@/components/ui/Icon';
import { HomeTutorialHost } from '@/components/home/HomeTutorialHost';
import { FeedbackChatBotMessage } from '@/components/feedback/FeedbackChatBotMessage';
import { FeedbackChatPanel } from '@/components/feedback/FeedbackChatPanel';
import {
  FEEDBACK_SERVICE_GUIDE_MESSAGES,
  shouldHideFeedbackFabOnMobile,
} from '@/constants/feedback';
import { useHomeTutorial } from '@/hooks/home/useHomeTutorial';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/cn';
import { useClubFeatures } from '@/providers/club-feature-provider';

interface FeedbackFabProps {
  className?: string;
}

/** 서비스 피드백 A안(feedbackFabEnabled)일 때 (main) 전 페이지 우측 하단에 Weeth FAB을 띄운다. */
function FeedbackFab({ className }: FeedbackFabProps) {
  const { feedbackFabEnabled } = useClubFeatures();

  // B안에서는 역할 조회 등 FAB 전용 훅이 실행되지 않도록 내부 컴포넌트를 아예 마운트하지 않는다.
  if (!feedbackFabEnabled) return null;
  return <FeedbackFabMenu className={className} />;
}

function FeedbackFabMenu({ className }: FeedbackFabProps) {
  const { clubId } = useParams<{ clubId: string }>();
  const pathname = usePathname();
  const isMobile = useMediaQuery('(max-width: 695.98px)');
  // 홈 자동 열림은 HomeTutorialLauncher가 담당하므로 FAB은 메뉴로 여는 경우만 다룬다.
  const tutorial = useHomeTutorial({ autoOpen: false });
  // 프로필 설정 모달이 마운트 시점에 마이페이지 쿼리를 호출하므로 처음 열 때까지 마운트를 미룬다.
  const [tutorialMounted, setTutorialMounted] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  const hideFab = isMobile && shouldHideFeedbackFabOnMobile(pathname, clubId);

  const handleServiceGuideSelect = () => {
    if (tutorial.tutorialVariant) {
      setTutorialMounted(true);
      tutorial.openTutorial();
      return;
    }
    setGuideOpen(true);
  };

  return (
    <>
      {!hideFab && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Weeth 메뉴"
              className={cn(
                'bg-container-neutral fixed right-[18px] bottom-[calc(18px+var(--safe-area-inset-bottom))] z-40 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full shadow-md',
                className,
              )}
            >
              <Icon src={LogoInitialIcon} size={28} className="text-icon-normal" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="end" sideOffset={8}>
            <DropdownMenuItem onSelect={handleServiceGuideSelect}>서비스 안내</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {tutorialMounted && (
        <HomeTutorialHost
          open={tutorial.isOpen}
          onOpenChange={tutorial.onOpenChange}
          slides={tutorial.slides}
        />
      )}

      <FeedbackChatPanel open={guideOpen} onOpenChange={setGuideOpen} title="서비스 안내">
        <div className="flex flex-col gap-600">
          {FEEDBACK_SERVICE_GUIDE_MESSAGES.map((message, index) => (
            <FeedbackChatBotMessage key={index} title={message.title} content={message.content} />
          ))}
        </div>
      </FeedbackChatPanel>
    </>
  );
}

export { FeedbackFab, type FeedbackFabProps };
