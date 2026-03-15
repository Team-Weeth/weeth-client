'use client';

import React from 'react';

import { AdminMeatballIcon } from '@/assets/icons';
import { Button, Icon } from '@/components/ui';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TextField } from '@/components/ui/TextField';
import { cn } from '@/lib/cn';

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
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState('');
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [selectedLabel, setSelectedLabel] = React.useState('직접 입력');
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const resetForm = () => {
    setInput('');
    setDropdownOpen(false);
    setSelectedLabel('직접 입력');
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) resetForm();
  };

  const handleSelectGeneration = (gen: number) => {
    setInput(String(gen));
    setSelectedLabel(`${gen}기`);
    setDropdownOpen(false);
  };

  const handleSelectDirect = () => {
    setInput('');
    setSelectedLabel('직접 입력');
    setDropdownOpen(false);
  };

  const isValid = input !== '' && Number(input) > 0;
  const isNewGeneration = isValid && !generations.includes(Number(input));

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit?.(Number(input));
    handleOpenChange(false);
  };

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

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
            {/* 숫자 입력 필드 */}
            <TextField
              type="number"
              min={1}
              value={input}
              onChange={(e) => {
                const v = (e.target as HTMLInputElement).value;
                if (v === '' || Number(v) > 0) {
                  setInput(v);
                  setSelectedLabel('직접 입력');
                }
              }}
              placeholder="숫자만 입력"
              className="h-12 flex-1"
            />

            {/* 드롭다운 버튼 */}
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                className={cn(
                  'bg-button-neutral flex h-12 w-36 cursor-pointer items-center justify-between rounded-sm px-400',
                  'text-text-strong typo-body2',
                )}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span className="typo-button2 truncate">{selectedLabel}</span>
                <Icon src={AdminMeatballIcon} alt="옵션" size={24} />
              </button>

              {/* 드롭다운 메뉴 */}
              {dropdownOpen && (
                <div className="bg-container-neutral absolute top-full right-0 z-10 mt-100 w-36 overflow-hidden rounded-sm shadow-lg">
                  <button
                    type="button"
                    className={cn(
                      'typo-body2 text-text-normal hover:bg-container-neutral-interaction w-full cursor-pointer px-400 py-300 text-left',
                      selectedLabel === '직접 입력' && 'text-brand-primary',
                    )}
                    onClick={handleSelectDirect}
                  >
                    직접 입력
                  </button>
                  {generations.map((gen) => (
                    <button
                      key={gen}
                      type="button"
                      className={cn(
                        'typo-body2 text-text-normal hover:bg-container-neutral-interaction w-full cursor-pointer px-400 py-300 text-left',
                        selectedLabel === `${gen}기` && 'text-brand-primary',
                      )}
                      onClick={() => handleSelectGeneration(gen)}
                    >
                      {gen}기
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 경고 텍스트 */}
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
