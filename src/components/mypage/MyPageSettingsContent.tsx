'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMediaQuery } from '@/hooks/useMediaQuery';
// import { useLeaveClubMutation } from '@/hooks/mutations/mypage/useMultiProfileMutations';
import { cn } from '@/lib/cn';
// import { toastError, toastSuccess } from '@/stores/useToastStore';
import { useThemeStore } from '@/stores/theme-store';
import type { ThemeMode } from '@/types/theme';
// import { getApiErrorMessage } from '@/utils/shared';
import { InfoSection } from './InfoSection';
import { LogoutConfirmDialog } from './LogoutConfirmDialog';
import { SupportListItem } from './SupportListItem';
import { ThemeModeModal } from './ThemeModeModal';
// import { WithdrawConfirmDialog } from './WithdrawConfirmDialog';

type MyPageSettingsContentProps = React.HTMLAttributes<HTMLDivElement>;

const THEME_MODE_LABELS: Record<ThemeMode, string> = {
  auto: '자동',
  light: '라이트',
  dark: '다크',
};

function MyPageSettingsContent({ className, ...props }: MyPageSettingsContentProps) {
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();
  const isBelowTablet = useMediaQuery('(max-width: 695.98px)');
  const mode = useThemeStore((state) => state.mode);
  const hasHydrated = useThemeStore((state) => state.hasHydrated);
  const setMode = useThemeStore((state) => state.setMode);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [selectedThemeMode, setSelectedThemeMode] = useState<ThemeMode>('auto');
  const [logoutOpen, setLogoutOpen] = useState(false);
  // const [withdrawOpen, setWithdrawOpen] = useState(false);
  // const leaveClubMutation = useLeaveClubMutation();

  const handleOpenThemeModal = () => {
    if (isBelowTablet) {
      router.push(`/${clubId}/mypage/settings/theme`);
      return;
    }
    setSelectedThemeMode(mode);
    setIsThemeModalOpen(true);
  };

  const handleConfirmThemeMode = () => {
    setMode(selectedThemeMode);
    setIsThemeModalOpen(false);
  };

  // const handleLeaveClub = async () => {
  //   try {
  //     await leaveClubMutation.mutateAsync({ clubId });
  //     toastSuccess('동아리에서 탈퇴되었습니다.');
  //     router.push('/club/select');
  //   } catch (error) {
  //     toastError(getApiErrorMessage(error) ?? '동아리 탈퇴에 실패했습니다.');
  //   }
  // };

  return (
    <div className={cn('flex min-w-0 flex-1 flex-col gap-6', className)} {...props}>
      <p className="typo-h3 text-text-normal">서비스 설정</p>

      <InfoSection title="화면 모드">
        <SupportListItem
          title={THEME_MODE_LABELS[mode]}
          variant="link"
          onClick={handleOpenThemeModal}
          className="py-400"
        />
      </InfoSection>

      <InfoSection title="고객지원">
        <div className="bg-container-neutral flex flex-col rounded-lg px-1 py-2">
          <div className="flex flex-col gap-2">
            <SupportListItem
              title="서비스 이용 약관"
              variant="link"
              href={`/${clubId}/terms`}
              layout="row"
            />
            <SupportListItem
              title="개인 정보 처리 방침"
              variant="link"
              href={`/${clubId}/privacy`}
              layout="row"
            />
          </div>

          <div className="tablet:px-400 my-2">
            <div className="bg-line h-px w-full" />
          </div>

          <div className="flex flex-col gap-2">
            <SupportListItem
              title="로그아웃"
              variant="link"
              layout="row"
              onClick={() => setLogoutOpen(true)}
            />
            {/* <SupportListItem
              title="탈퇴하기"
              variant="link"
              layout="row"
              onClick={() => setWithdrawOpen(true)}
            /> */}
          </div>

          <div className="tablet:px-400 my-2">
            <div className="bg-line h-px w-full" />
          </div>

          <SupportListItem
            title="서비스 문의 메일"
            variant="copy"
            copyText="help@weeth.kr"
            layout="row"
          />
        </div>
      </InfoSection>

      <ThemeModeModal
        open={isThemeModalOpen}
        onOpenChange={setIsThemeModalOpen}
        selectedMode={selectedThemeMode}
        onSelectMode={setSelectedThemeMode}
        onConfirm={handleConfirmThemeMode}
        disabled={!hasHydrated}
      />

      {/* <WithdrawConfirmDialog
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        onConfirm={() => {
          void handleLeaveClub();
        }}
        title={'동아리에서 탈퇴할까요?'}
        description={'탈퇴하면 이 동아리의 프로필과 활동 정보를 더 이상 사용할 수 없어요.'}
        confirmLabel={leaveClubMutation.isPending ? '탈퇴 중...' : '탈퇴하기'}
      /> */}
      <LogoutConfirmDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
    </div>
  );
}

export { MyPageSettingsContent, type MyPageSettingsContentProps };
