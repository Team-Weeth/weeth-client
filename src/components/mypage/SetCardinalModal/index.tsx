'use client';

import { Dialog, DialogContent } from '@/components/ui';
import type { ClubDto } from '@/types/mypage';
import { useCardinalModal } from './useCardinalModal';
import { ModalHeader } from './components/ModalHeader';
import { ModalFooter } from './components/ModalFooter';
import { Step1Info } from './components/steps/Step1Info';
import { Step2Select, CardinalTags } from './components/steps/Step2Select';
import { Step3Confirm } from './components/steps/Step3Confirm';

const TITLES = [
  '활동 기수 설정을 시작할게요.',
  '활동한 기수를 모두 선택해주세요.',
  '설정 내용을 확인해주세요',
] as const;

interface SetCardinalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  club: ClubDto;
  availableCardinals: number[];
  onSave: (selected: number[]) => void;
}

function SetCardinalModal({
  open,
  onOpenChange,
  club,
  availableCardinals,
  onSave,
}: SetCardinalModalProps) {
  const {
    step,
    setStep,
    selected,
    selectedArray,
    handleOpenChange,
    handleClose,
    handleToggle,
    handleSave,
  } = useCardinalModal({ onOpenChange, onSave });

  const overline = `'${club.name}' 활동 기수 설정`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bg-container-neutral-alternative border-line flex h-[481px] w-full max-w-[540px] flex-col gap-0 rounded-lg p-0"
      >
        <ModalHeader
          step={step}
          total={3}
          overline={overline}
          title={TITLES[step - 1]}
          onClose={handleClose}
        />

        {step === 1 && <Step1Info />}
        {step === 2 && (
          <Step2Select
            availableCardinals={availableCardinals}
            selected={selected}
            onToggle={handleToggle}
          />
        )}
        {step === 3 && <Step3Confirm club={club} selected={selectedArray} />}

        {step === 1 && (
          <ModalFooter
            primaryLabel="기수 설정하기"
            secondaryLabel="취소"
            onPrimary={() => setStep(2)}
            onSecondary={handleClose}
          />
        )}
        {step === 2 && (
          <ModalFooter
            primaryLabel={`다음 (${selected.size}개 선택)`}
            secondaryLabel="취소"
            onPrimary={() => setStep(3)}
            onSecondary={handleClose}
            primaryDisabled={selected.size === 0}
          >
            {selected.size > 0 && (
              <div className="flex items-center gap-400 px-[10px] pt-200">
                <span className="typo-sub2 text-text-alternative shrink-0">선택됨</span>
                <CardinalTags cardinals={selectedArray} />
              </div>
            )}
          </ModalFooter>
        )}
        {step === 3 && (
          <ModalFooter
            primaryLabel="저장하기"
            secondaryLabel="이전"
            onPrimary={handleSave}
            onSecondary={() => setStep(2)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export { SetCardinalModal, type SetCardinalModalProps };
