'use client';

import { useState } from 'react';

import { AdminCloseIcon } from '@/assets/icons/admin';
import { ModalIconButton } from '@/components/admin/modal/ModalIconButton';
import { SCHEDULE_MODAL_FOOTER_CLASS } from '@/components/admin/schedule/modal/constants';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { PENALTY_GUIDE_MAX_LENGTH } from '@/constants/admin/penaltyTable.constants';

interface PenaltySettingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 저장되어 있는 페널티 규정 */
  guide: string;
  onSave: (guide: string) => void;
}

function PenaltySettingModal({ open, onOpenChange, guide, onSave }: PenaltySettingModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-background max-tablet:max-h-[calc(100dvh-1rem)] flex max-h-[calc(100dvh-2rem)] w-[778px] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-lg p-0"
        showCloseButton={false}
      >
        {/* 닫았다 열면 다시 마운트되어 초안이 저장된 값으로 초기화된다 */}
        <PenaltySettingForm guide={guide} onSave={onSave} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function PenaltySettingForm({
  guide,
  onSave,
  onClose,
}: {
  guide: string;
  onSave: (guide: string) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(guide);

  const trimmed = draft.trim();

  return (
    <form
      className="flex min-h-0 flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(trimmed);
      }}
    >
      <div className="flex shrink-0 items-center justify-between px-700 pt-600 pb-450">
        <DialogTitle className="typo-h3 text-text-strong">페널티 규정 입력</DialogTitle>
        <ModalIconButton icon={AdminCloseIcon} label="닫기" onClick={onClose} />
      </div>

      <div className="scrollbar-custom flex min-h-0 flex-col overflow-y-auto px-700 pt-400 pb-700">
        <label htmlFor="penalty-guide" className="typo-sub3 text-text-normal px-100 py-200">
          내용
        </label>

        <div className="flex flex-col gap-200">
          {/* 높이를 고정해 모달 대신 textarea 내부에서 스크롤되게 한다 */}
          <Textarea
            id="penalty-guide"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={PENALTY_GUIDE_MAX_LENGTH}
            placeholder="페널티를 받는 기준을 작성해주세요"
            className="typo-body1 h-[150px] px-400 py-[13px]"
          />
          <p className="typo-caption2 text-text-alternative px-100 text-right">
            {draft.length}/{PENALTY_GUIDE_MAX_LENGTH}
          </p>
        </div>
      </div>

      <div className={SCHEDULE_MODAL_FOOTER_CLASS}>
        <Button variant="secondary" size="lg" onClick={onClose}>
          취소
        </Button>
        <Button type="submit" variant="primary" size="lg" disabled={trimmed.length === 0}>
          저장
        </Button>
      </div>
    </form>
  );
}

export { PenaltySettingModal, type PenaltySettingModalProps };
