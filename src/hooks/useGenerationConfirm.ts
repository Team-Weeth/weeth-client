import { useState } from 'react';

function useGenerationConfirm(onChangeGeneration?: (generation: number) => void) {
  const [genConfirmOpen, setGenConfirmOpen] = useState(false);
  const [pendingGeneration, setPendingGeneration] = useState(0);

  const handleGenSubmit = (generation: number) => {
    setPendingGeneration(generation);
    setGenConfirmOpen(true);
  };

  const handleGenConfirm = () => {
    onChangeGeneration?.(pendingGeneration);
    setGenConfirmOpen(false);
    setPendingGeneration(0);
  };

  return {
    genConfirmOpen,
    setGenConfirmOpen,
    pendingGeneration,
    handleGenSubmit,
    handleGenConfirm,
  };
}

export { useGenerationConfirm };
