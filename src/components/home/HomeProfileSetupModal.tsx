'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import AddIcon from '@/assets/icons/add.svg';
import DeleteIcon from '@/assets/icons/delete.svg';
import { useHomeQuery } from '@/hooks/home';
import { useUpdateClubProfileAssignmentsMutation } from '@/hooks/mutations/mypage/useMultiProfileMutations';
import { useMyPageQueries } from '@/hooks/queries/mypage/useMyPageQueries';
import { toastError, toastSuccess } from '@/stores/useToastStore';
import { getApiErrorMessage } from '@/utils/shared';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { AddProfileModal } from '@/components/mypage/AddProfileModal';

interface HomeProfileSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function HomeProfileSetupModal({ open, onOpenChange }: HomeProfileSetupModalProps) {
  const { clubId } = useParams<{ clubId: string }>();
  const { data: clubInfo } = useHomeQuery({
    select: (data) => ({
      name: data.club.name,
      profileImageUrl: data.club.profileImageUrl,
    }),
  });
  const { usingProfiles, currentProfile, summaryQuery } = useMyPageQueries(clubId);
  const updateAssignmentsMutation = useUpdateClubProfileAssignmentsMutation();
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [addProfileModalOpen, setAddProfileModalOpen] = useState(false);

  const resolvedSelectedProfileId = selectedProfileId ?? String(currentProfile?.profileId ?? '');
  const handleClose = () => {
    setSelectedProfileId(null);
    onOpenChange(false);
  };

  const handleModalOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSelectedProfileId(null);
    }
    onOpenChange(nextOpen);
  };

  const handleCreateProfile = () => {
    handleClose();
    setAddProfileModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!resolvedSelectedProfileId) return;

    try {
      await updateAssignmentsMutation.mutateAsync({
        assignments: [
          {
            clubId,
            profileId: Number(resolvedSelectedProfileId),
          },
        ],
      });
      toastSuccess('사용 프로필이 변경되었습니다.');
      handleClose();
    } catch (error) {
      toastError(getApiErrorMessage(error) ?? '사용 프로필 변경에 실패했습니다.');
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleModalOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="bg-background w-[400px] max-w-[calc(100%-2rem)] rounded-xl p-400"
        >
          <div className="flex items-start justify-between pb-400">
            <div className="flex flex-col gap-4">
              <Avatar size={64} type="square">
                <AvatarImage src={clubInfo?.profileImageUrl ?? undefined} alt={clubInfo?.name} />
                <AvatarFallback variant="club" />
              </Avatar>
              <DialogTitle className="typo-h3 text-text-strong">
                어떤 프로필로 시작할까요?
              </DialogTitle>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="text-icon-normal cursor-pointer p-1"
              aria-label="프로필 설정 닫기"
            >
              <Icon src={DeleteIcon} size={24} />
            </button>
          </div>

          <div className="divide-line scrollbar-none max-h-[221px] divide-y overflow-y-auto py-400">
            {summaryQuery.isPending ? (
              <div className="py-400">
                <p className="typo-body2 text-text-alternative">프로필을 불러오는 중입니다.</p>
              </div>
            ) : (
              usingProfiles.map((profile) => {
                const isSelected = String(profile.profileId) === resolvedSelectedProfileId;

                return (
                  <button
                    key={profile.profileId}
                    type="button"
                    onClick={() => setSelectedProfileId(String(profile.profileId))}
                    className="flex w-full items-center justify-between py-400 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar size={36} type="round">
                        <AvatarImage
                          src={profile.profileImageUrl ?? undefined}
                          alt={profile.name}
                        />
                        <AvatarFallback />
                      </Avatar>
                      <div className="flex flex-col gap-1">
                        <p className="typo-sub3 text-text-strong font-medium">{profile.name}</p>
                        <p
                          className={cn(
                            'typo-caption1 line-clamp-1 min-h-[18px]',
                            profile.bio ? 'text-text-alternative' : 'invisible',
                          )}
                        >
                          {profile.bio ?? ' '}
                        </p>
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
                      {isSelected && <div className="size-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <Button
            variant="secondary"
            size="lg"
            onClick={handleCreateProfile}
            className="my-4 flex gap-100"
          >
            <Icon src={AddIcon} size={18} className="text-icon-normal" />
            <span className="typo-button1 text-text-strong">새 프로필 만들기</span>
          </Button>

          <div className="flex gap-200">
            <Button variant="secondary" size="lg" className="flex-1" onClick={handleClose}>
              취소
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              disabled={
                updateAssignmentsMutation.isPending ||
                !resolvedSelectedProfileId ||
                resolvedSelectedProfileId === String(currentProfile?.profileId ?? '')
              }
              onClick={() => {
                void handleConfirm();
              }}
            >
              {updateAssignmentsMutation.isPending ? '선택 중...' : '선택'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AddProfileModal
        open={addProfileModalOpen}
        onOpenChange={setAddProfileModalOpen}
        tutorialMode
        initialSelectedClubIds={[clubId]}
      />
    </>
  );
}

export { HomeProfileSetupModal, type HomeProfileSetupModalProps };
