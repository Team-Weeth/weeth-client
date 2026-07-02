'use client';

import { useRouter } from 'next/navigation';
import { BackIcon } from '@/assets/icons';
import { useAddProfileFlow } from '@/hooks/mypage';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import { StepOneContent } from './AddProfileModal/StepOneContent';
import { StepTwoContent } from './AddProfileModal/StepTwoContent';

type AddProfilePageContentProps = React.HTMLAttributes<HTMLDivElement>;

function AddProfilePageContent({ className, ...props }: AddProfilePageContentProps) {
  const router = useRouter();
  const {
    step,
    setStep,
    selectedClubIds,
    control,
    errors,
    resetFlow,
    handleToggleClub,
    handleNext,
  } = useAddProfileFlow();

  const handleClose = () => {
    resetFlow();
    router.back();
  };

  const handleConfirm = () => {
    handleClose();
  };

  return (
    <div
      className={cn('tablet:hidden flex min-w-0 flex-1 flex-col gap-4 pb-[168px]', className)}
      {...props}
    >
      <div className="flex items-center gap-1 py-300">
        <button
          type="button"
          onClick={handleClose}
          className="flex items-center justify-center p-1"
        >
          <Icon src={BackIcon} size={21} className="text-icon-normal p-1" />
        </button>
        <h1 className="typo-sub1 text-text-normal">프로필 추가하기</h1>
      </div>

      <div className="flex items-center gap-[9px]">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'h-1 flex-1 rounded-full',
              step === index + 1 ? 'bg-button-primary' : 'bg-button-neutral',
            )}
          />
        ))}
      </div>

      {step === 1 ? (
        <StepOneContent
          control={control}
          errors={errors}
          onCancel={handleClose}
          onNext={handleNext}
          cancelAsDialogClose={false}
          mobileFixedFooter
        />
      ) : (
        <StepTwoContent
          selectedClubIds={selectedClubIds}
          onToggleClub={handleToggleClub}
          onPrev={() => setStep(1)}
          onConfirm={handleConfirm}
          mobileFixedFooter
        />
      )}
    </div>
  );
}

export { AddProfilePageContent, type AddProfilePageContentProps };
