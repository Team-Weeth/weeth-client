'use client';

import { useState } from 'react';
import { CheckIcon, DeleteIcon } from '@/assets/icons';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Icon,
} from '@/components/ui';
import { cn } from '@/lib/cn';
import type { ClubDto } from '@/types/mypage';

interface ProfileSelectModalProps {
  open: boolean;
  club: ClubDto;
  currentProfileId: string;
  profiles: ClubDto[];
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

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm?.(selectedProfileId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bg-background w-[400px] max-w-[calc(100%-2rem)] rounded-xl p-400"
      >
        <div className="flex items-start justify-between pb-400">
          <div className="flex flex-col gap-4">
            <Avatar size={64} type="square">
              <AvatarImage src={club.profileImageUrl ?? undefined} alt={club.name} />
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
            className="text-icon-normal cursor-pointer p-1"
            aria-label="프로필 선택 닫기"
          >
            <Icon src={DeleteIcon} size={24} />
          </button>
        </div>

        <div className="divide-line h-[232px] divide-y overflow-y-auto py-400">
          {profiles.map((profile) => {
            const isSelected = profile.id === selectedProfileId;

            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => setSelectedProfileId(profile.id)}
                className="flex w-full items-center justify-between py-400 text-left"
              >
                <div className="flex items-center gap-2">
                  <Avatar size={36} type="round">
                    <AvatarImage src={profile.profileImageUrl ?? undefined} alt={profile.name} />
                    <AvatarFallback />
                  </Avatar>
                  <div className="flex flex-col gap-1">
                    <p className="typo-sub3 text-text-strong font-medium">{profile.name}</p>
                    {profile.description && (
                      <p className="typo-caption1 text-text-alternative line-clamp-1">
                        {profile.description}
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

        <div className="flex gap-200">
          <Button variant="secondary" size="lg" className="flex-1" onClick={handleClose}>
            취소
          </Button>
          <Button variant="primary" size="lg" className="flex-1" onClick={handleConfirm}>
            확인
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { ProfileSelectModal, type ProfileSelectModalProps };
