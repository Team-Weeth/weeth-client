import { useState } from 'react';
import { useInitCardinalsMutation } from '@/hooks/mutations/mypage/useInitCardinalsMutation';
import { toastSuccess, toastError } from '@/stores/useToastStore';

interface UseCardinalModalProps {
  onOpenChange: (open: boolean) => void;
  onSave?: (selected: number[]) => void;
}

function useCardinalModal({ onOpenChange, onSave }: UseCardinalModalProps) {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const { mutate: initCardinals, isPending } = useInitCardinalsMutation();

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setStep(1);
      setSelected(new Set());
    }
    onOpenChange(nextOpen);
  };

  const handleClose = () => handleOpenChange(false);

  const handleToggle = (n: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(n)) {
        next.delete(n);
      } else {
        next.add(n);
      }
      return next;
    });
  };

  const handleSave = () => {
    const cardinals = [...selected].sort((a, b) => a - b);
    initCardinals(cardinals, {
      onSuccess: () => {
        toastSuccess('활동 기수가 설정되었습니다.');
        onSave?.(cardinals);
        handleClose();
      },
      onError: () => {
        toastError('활동 기수 설정에 실패했습니다.');
      },
    });
  };

  return {
    step,
    setStep,
    selected,
    isPending,
    handleOpenChange,
    handleClose,
    handleToggle,
    handleSave,
  };
}

export { useCardinalModal };
