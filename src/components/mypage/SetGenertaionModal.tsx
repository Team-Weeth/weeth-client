'use client';
import { useState } from 'react';
import { Dialog, DialogClose, DialogContent } from '../ui';

type stepType = {
  step: 1 | 2 | 3;
};

function setGenerationModal() {
  const [step, setStep] = useState<stepType>(1);

  return (
    <div>
      <Dialog>
        <DialogClose />
        <DialogContent></DialogContent>
      </Dialog>
    </div>
  );
}
