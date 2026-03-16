'use client';

import React, { useState } from 'react';

import { Button } from '@/components/ui';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TextField } from '@/components/ui/TextField';

import { GenerationDropdown } from './GenerationDropdown';

const DIRECT_INPUT_LABEL = '직접 입력';

interface ChangeGenerationModalProps {
  children: React.ReactNode;
  generations?: number[];
  onSubmit?: (generation: number) => void;
}

function ChangeGenerationModal({
  children,
  generations = [],
  onSubmit,
}: ChangeGenerationModalProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [selectedLabel, setSelectedLabel] = useState(DIRECT_INPUT_LABEL);

  const resetForm = () => {
    setInput('');
    setSelectedLabel(DIRECT_INPUT_LABEL);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) resetForm();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v === '' || Number(v) > 0) {
      setInput(v);
      setSelectedLabel(DIRECT_INPUT_LABEL);
    }
  };

  const handleSelectGeneration = (gen: number) => {
    setInput(String(gen));
    setSelectedLabel(`${gen}기`);
  };

  const handleSelectDirect = () => {
    setInput('');
    setSelectedLabel(DIRECT_INPUT_LABEL);
  };

  const isValid = input !== '' && Number(input) > 0;
  const isNewGeneration = isValid && !generations.includes(Number(input));

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit?.(Number(input));
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="bg-background min-h-78.75 w-99.5 min-w-90 grid-rows-[auto_1fr_auto] p-0"
        showCloseButton={false}
      >
        <DialogHeader title="기수 변경" className="px-600 pt-600 pb-0" />

        <DialogBody className="gap-200 overflow-visible px-600 py-0 pt-12.5">
          <div className="flex items-center gap-200">
            <TextField
              type="number"
              min={1}
              value={input}
              onChange={handleInputChange}
              placeholder="숫자만 입력"
              className="h-12 flex-1"
            />
            <GenerationDropdown
              generations={generations}
              selectedLabel={selectedLabel}
              onSelectGeneration={handleSelectGeneration}
              onSelectDirect={handleSelectDirect}
            />
          </div>

          {isNewGeneration && (
            <p className="typo-caption1 text-state-caution">
              *저장되지 않은 숫자는 새로운 기수로 추가됩니다.
            </p>
          )}
        </DialogBody>

        <DialogFooter className="bg-container-neutral max-h-[72px] rounded-b-lg px-300 pb-300">
          <div className="flex items-center justify-end gap-200">
            <Button variant="secondary" size="lg" onClick={() => handleOpenChange(false)}>
              취소
            </Button>
            <Button variant="primary" size="lg" disabled={!isValid} onClick={handleSubmit}>
              저장
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { ChangeGenerationModal, type ChangeGenerationModalProps };
