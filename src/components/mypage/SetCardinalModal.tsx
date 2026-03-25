'use client';

import { useState } from 'react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  Divider,
  Icon,
  Tag,
} from '@/components/ui';
import { DeleteIcon, InfoIcon } from '@/assets/icons';
import type { ClubDto } from '@/types/mypage';
import { cn } from '@/lib/cn';

/* ── Step Indicator ─────────────────────────────────────────────────── */
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex w-[133px] gap-[9px]">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-1 flex-1 rounded-full',
            i < current ? 'bg-button-primary' : 'bg-button-neutral',
          )}
        />
      ))}
    </div>
  );
}

/* ── Modal Header ───────────────────────────────────────────────────── */
function ModalHeader({
  step,
  total,
  overline,
  title,
  onClose,
}: {
  step: number;
  total: number;
  overline: string;
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-400 p-400">
      <div className="flex flex-1 flex-col gap-400">
        <StepIndicator current={step} total={total} />
        <div className="flex flex-col gap-200">
          <p className="typo-caption1 text-text-alternative">{overline}</p>
          <p className="typo-sub1 text-text-strong">{title}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="flex cursor-pointer items-center justify-center rounded-sm p-200"
      >
        <Icon src={DeleteIcon} size={24} className="text-icon-normal" />
      </button>
    </div>
  );
}

/* ── Step 1: 안내 ───────────────────────────────────────────────────── */
function Step1Body() {
  return (
    <div className="px-400 pb-400">
      <div className="bg-container-neutral-alternative flex flex-col items-center gap-400 rounded-md p-300">
        <div className="flex items-center justify-center rounded-full bg-brand-primary/10 p-300">
          <Icon src={InfoIcon} size={24} className="text-brand-primary" />
        </div>
        <div className="flex flex-col gap-200 text-center">
          <p className="typo-sub2 text-brand-primary">설정 전 확인해 주세요</p>
          <p className="typo-body2 text-text-normal">
            활동한 기수를 정확히 선택해 주세요. 설정 후에는 수정이 불가합니다.
            <br />
            잘못 설정한 경우 동아리 운영진에게 문의해 주세요.
          </p>
        </div>
      </div>
    </div>
  );
}

function Step1Footer({ onCancel, onNext }: { onCancel: () => void; onNext: () => void }) {
  return (
    <div className="flex flex-col gap-[10px] px-400 pb-400 pt-px">
      <Divider />
      <div className="flex gap-200 pt-300">
        <Button variant="secondary" size="lg" className="flex-1" onClick={onCancel}>
          취소
        </Button>
        <Button size="lg" className="flex-1" onClick={onNext}>
          기수 설정하기
        </Button>
      </div>
    </div>
  );
}

/* ── Step 2: 기수 선택 ──────────────────────────────────────────────── */
function Step2Body({
  availableCardinals,
  selected,
  onToggle,
}: {
  availableCardinals: number[];
  selected: number[];
  onToggle: (n: number) => void;
}) {
  return (
    <div className="px-400 pb-400">
      <div className="grid grid-cols-5 gap-[5px]">
        {availableCardinals.map((cardinal) => {
          const isSelected = selected.includes(cardinal);
          return (
            <button
              key={cardinal}
              type="button"
              onClick={() => onToggle(cardinal)}
              className={cn(
                'typo-button2 flex min-w-[40px] items-center justify-center rounded-[10px] px-400 py-200 transition-colors',
                isSelected
                  ? 'bg-button-primary text-text-inverse'
                  : 'border-line bg-button-neutral border text-text-normal',
              )}
            >
              {cardinal}기
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Step2Footer({
  selected,
  onCancel,
  onNext,
}: {
  selected: number[];
  onCancel: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-[10px] px-400 pb-400 pt-px">
      <Divider />
      {selected.length > 0 && (
        <div className="flex items-center gap-400 px-[10px] pt-200">
          <span className="typo-sub2 text-text-alternative shrink-0">선택됨</span>
          <div className="flex flex-wrap gap-100">
            {selected.map((n) => (
              <Tag key={n} className="bg-brand-primary/10 text-brand-primary">
                {n}기
              </Tag>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-200 pt-200">
        <Button variant="secondary" size="lg" className="flex-1" onClick={onCancel}>
          취소
        </Button>
        <Button
          size="lg"
          className="flex-1"
          disabled={selected.length === 0}
          onClick={onNext}
        >
          다음 ({selected.length}개 선택)
        </Button>
      </div>
    </div>
  );
}

/* ── Step 3: 확인 ───────────────────────────────────────────────────── */
function Step3Body({ club, selected }: { club: ClubDto; selected: number[] }) {
  return (
    <div className="flex flex-col gap-300 px-400 pb-400">
      {/* 동아리 카드 */}
      <div className="bg-container-neutral flex flex-col gap-450 rounded-lg px-450 pb-450 pt-[22px]">
        <div className="flex items-center gap-400">
          <Avatar size={64} type="square" className="border-line border">
            {club.profileImageUrl && (
              <AvatarImage src={club.profileImageUrl} alt={club.name} />
            )}
            <AvatarFallback>{club.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-[2px]">
            <p className="typo-sub1 text-text-strong">{club.name}</p>
            {club.description && (
              <p className="typo-body2 text-text-normal">{club.description}</p>
            )}
          </div>
        </div>

        <Divider />

        <div className="flex flex-col gap-200 px-[10px]">
          <span className="typo-sub2 text-text-alternative">활동 기수</span>
          <div className="flex flex-wrap gap-100">
            {selected.map((n) => (
              <Tag key={n} className="bg-brand-primary/10 text-brand-primary">
                {n}기
              </Tag>
            ))}
          </div>
        </div>
      </div>

      {/* 경고 배너 */}
      <div className="flex items-start gap-200 rounded-md bg-state-caution/10 p-300">
        <Icon src={InfoIcon} size={20} className="text-state-caution shrink-0" />
        <p className="typo-body2 text-text-strong">확정 후에는 수정할 수 없습니다.</p>
      </div>
    </div>
  );
}

function Step3Footer({ onBack, onSave }: { onBack: () => void; onSave: () => void }) {
  return (
    <div className="flex flex-col gap-[10px] px-400 pb-400 pt-px">
      <Divider />
      <div className="flex gap-200 pt-300">
        <Button variant="secondary" size="lg" className="flex-1" onClick={onBack}>
          이전
        </Button>
        <Button size="lg" className="flex-1" onClick={onSave}>
          저장하기
        </Button>
      </div>
    </div>
  );
}

/* ── Main Modal ─────────────────────────────────────────────────────── */
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
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);

  const overline = `'${club.name}' 활동 기수 설정`;

  const titles: Record<number, string> = {
    1: '활동 기수 설정을 시작할게요.',
    2: '활동한 기수를 모두 선택해주세요.',
    3: '설정 내용을 확인해주세요',
  };

  const handleClose = () => {
    onOpenChange(false);
    // 닫을 때 초기화
    setTimeout(() => {
      setStep(1);
      setSelected([]);
    }, 200);
  };

  const handleToggle = (n: number) => {
    setSelected((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n],
    );
  };

  const handleSave = () => {
    onSave(selected);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex w-full max-w-[540px] flex-col gap-0 rounded-lg border-line p-0"
      >
        <ModalHeader
          step={step}
          total={3}
          overline={overline}
          title={titles[step]}
          onClose={handleClose}
        />

        {step === 1 && <Step1Body />}
        {step === 2 && (
          <Step2Body
            availableCardinals={availableCardinals}
            selected={selected}
            onToggle={handleToggle}
          />
        )}
        {step === 3 && <Step3Body club={club} selected={selected} />}

        {step === 1 && (
          <Step1Footer onCancel={handleClose} onNext={() => setStep(2)} />
        )}
        {step === 2 && (
          <Step2Footer
            selected={selected}
            onCancel={handleClose}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <Step3Footer onBack={() => setStep(2)} onSave={handleSave} />
        )}
      </DialogContent>
    </Dialog>
  );
}

export { SetCardinalModal, type SetCardinalModalProps };
