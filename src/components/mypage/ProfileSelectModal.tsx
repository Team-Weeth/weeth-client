'use client';

import { useState } from 'react';
import CheckIcon from '@/assets/icons/check.svg';
import DeleteIcon from '@/assets/icons/delete.svg';
import { useUpdateClubProfileAssignmentsMutation } from '@/hooks/mutations/mypage/useMultiProfileMutations';
import { toastError, toastSuccess } from '@/stores/useToastStore';
import { getApiErrorMessage } from '@/utils/shared';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import type { MyPageAssignableClub, MyPageUsingProfile } from '@/types/mypage';

interface ProfileSelectModalProps {
  open: boolean;
  club: MyPageAssignableClub;
  currentProfileId: string;
  profiles: MyPageUsingProfile[];
  onOpenChange: (open: boolean) => void;
  onConfirm?: (profileId: string) => void;
}

function ProfileSelectModal({
  open,
  club,
  currentProfileId,
  profiles,
  onOpenChange,
  onConfirm,
}: ProfileSelectModalProps) {
  const [selectedProfileId, setSelectedProfileId] = useState(currentProfileId);
  const updateAssignmentsMutation = useUpdateClubProfileAssignmentsMutation();
  const isPending = updateAssignmentsMutation.isPending;

  const handleClose = () => {
    if (isPending) return;
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    try {
      await updateAssignmentsMutation.mutateAsync({
        assignments: [
          {
            clubId: club.clubId,
            profileId: Number(selectedProfileId),
          },
        ],
      });
      onConfirm?.(selectedProfileId);
      toastSuccess('사용 프로필이 변경되었습니다.');
      onOpenChange(false);
    } catch (error) {
      toastError(getApiErrorMessage(error) ?? '사용 프로필 변경에 실패했습니다.');
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isPending && !nextOpen) return;
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="bg-background w-[400px] max-w-[calc(100%-2rem)] rounded-xl p-400"
      >
        <div className="flex items-start justify-between pb-400">
          <div className="flex flex-col gap-4">
            <Avatar size={64} type="square">
              <AvatarImage src={club.clubImage ?? undefined} alt={club.name} />
              <AvatarFallback variant="club" />
            </Avatar>
            <DialogTitle className="typo-sub1 text-text-strong">
              {club.name}에서 <br />
              사용할 프로필을 선택하세요.
            </DialogTitle>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="text-icon-normal cursor-pointer p-1"
            aria-label="프로필 선택 닫기"
          >
            <Icon src={DeleteIcon} size={24} />
          </button>
        </div>

        <div className="divide-line h-[232px] divide-y overflow-y-auto">
          {profiles.map((profile) => {
            const isSelected = String(profile.profileId) === selectedProfileId;

            return (
              <button
                key={profile.profileId}
                type="button"
                onClick={() => setSelectedProfileId(String(profile.profileId))}
                className="flex w-full items-center justify-between py-400 text-left"
              >
                <div className="flex items-center gap-2">
                  <Avatar size={36} type="round">
                    <AvatarImage src={profile.profileImageUrl ?? undefined} alt={profile.name} />
                    <AvatarFallback />
                  </Avatar>
                  <div className="flex flex-col gap-1">
                    <p className="typo-sub3 text-text-strong font-medium">{profile.name}</p>
                    {profile.bio && (
                      <p className="typo-caption1 text-text-alternative line-clamp-1">
                        {profile.bio}
                      </p>
                    )}
                  </div>
                </div>

                <div
                  className={cn(
                    'flex size-5 items-center justify-center rounded-full border-[2px]',
                    isSelected
                      ? 'border-brand-primary bg-brand-primary'
                      : 'border-icon-alternative bg-transparent',
                  )}
                >
                  {isSelected && <Icon src={CheckIcon} size={18} className="text-white" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex gap-200 pt-400">
          <Button
            variant="secondary"
            size="lg"
            className="flex-1"
            disabled={isPending}
            onClick={handleClose}
          >
            취소
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            disabled={isPending}
            onClick={() => {
              void handleConfirm();
            }}
          >
            {isPending ? '변경 중...' : '확인'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { ProfileSelectModal, type ProfileSelectModalProps };
