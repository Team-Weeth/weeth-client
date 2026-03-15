'use client';

import React from 'react';

import { AdminCheckboxIcon, AdminUncheckboxIcon } from '@/assets/icons';
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

interface AddGenerationModalProps {
  children: React.ReactNode;
  onSubmit?: (data: {
    generation: number;
    year: number;
    semester: number;
    isCurrent: boolean;
  }) => void;
}

function AddGenerationModal({ children, onSubmit }: AddGenerationModalProps) {
  const [open, setOpen] = React.useState(false);
  const [generation, setGeneration] = React.useState('');
  const [year, setYear] = React.useState('');
  const [semester, setSemester] = React.useState('');
  const [isCurrent, setIsCurrent] = React.useState(false);

  const resetForm = () => {
    setGeneration('');
    setYear('');
    setSemester('');
    setIsCurrent(false);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) resetForm();
  };

  const isValid = generation !== '' && year !== '' && semester !== '';

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit?.({
      generation: Number(generation),
      year: Number(year),
      semester: Number(semester),
      isCurrent,
    });
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="bg-background w-97.5 min-w-90 p-700">
        <DialogHeader title="새로운 기수 추가" />

        <DialogBody className="gap-400 py-0">
          {/* 기수 입력 */}
          <div className="flex flex-col">
            <p className="typo-sub2 text-text-normal bg-background py-300">
              추가할 새로운 기수를 작성해주세요
            </p>
            <div className="relative">
              <TextField
                type="number"
                min={1}
                value={generation}
                onChange={(e) => {
                  const v = (e.target as HTMLInputElement).value;
                  if (v === '' || Number(v) > 0) setGeneration(v);
                }}
                className="pr-10"
                placeholder=" "
              />
              <span className="typo-body2 text-text-alternative pointer-events-none absolute top-1/2 right-400 -translate-y-1/2">
                기
              </span>
            </div>
          </div>

          {/* 활동 시기 */}
          <div className="flex flex-col">
            <p className="typo-sub2 text-text-normal py-300">활동 시기</p>
            <div className="flex gap-200">
              <div className="relative flex-1">
                <TextField
                  type="number"
                  min={1}
                  value={year}
                  onChange={(e) => {
                    const v = (e.target as HTMLInputElement).value;
                    if (v === '' || Number(v) > 0) setYear(v);
                  }}
                  className="pr-10"
                  placeholder=" "
                />
                <span className="typo-body2 text-text-alternative pointer-events-none absolute top-1/2 right-400 -translate-y-1/2">
                  년
                </span>
              </div>
              <div className="relative flex-1">
                <TextField
                  type="number"
                  min={1}
                  value={semester}
                  onChange={(e) => {
                    const v = (e.target as HTMLInputElement).value;
                    if (v === '' || Number(v) > 0) setSemester(v);
                  }}
                  className="pr-10"
                  placeholder=" "
                />
                <span className="typo-body2 text-text-alternative pointer-events-none absolute top-1/2 right-400 -translate-y-1/2">
                  학기
                </span>
              </div>
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="flex cursor-pointer items-center gap-200"
              onClick={() => setIsCurrent(!isCurrent)}
            >
              <Icon
                src={isCurrent ? AdminCheckboxIcon : AdminUncheckboxIcon}
                alt={isCurrent ? '선택됨' : '선택 안됨'}
                size={24}
              />
              <span className="typo-button2 text-text-normal">현재 진행 중</span>
            </button>
            <Button variant="secondary" size="lg" disabled={!isValid} onClick={handleSubmit}>
              저장
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { AddGenerationModal, type AddGenerationModalProps };
