import { useState } from 'react';

interface UseCardinalModalProps {
  onOpenChange: (open: boolean) => void;
  onSave: (selected: number[]) => void;
}

function useCardinalModal({ onOpenChange, onSave }: UseCardinalModalProps) {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<Set<number>>(new Set());

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
    onSave([...selected]);
    handleClose();
  };

  return {
    step,
    setStep,
    selected,
    handleOpenChange,
    handleClose,
    handleToggle,
    handleSave,
  };
}

export { useCardinalModal };
