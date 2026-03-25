'use client';

import { useState } from 'react';

import { ArrowLeftIcon, ArrowRightIcon, CheckRoundIcon } from '@/assets/icons';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  Divider,
  Icon,
} from '@/components/ui';
import { TERMS_DESCRIPTION, TERMS_ITEMS } from '@/constants/terms';
import { cn } from '@/lib/cn';

interface TermsAgreementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgree: () => void;
}

function TermsAgreementModal({ open, onOpenChange, onAgree }: TermsAgreementModalProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);

  const allChecked = TERMS_ITEMS.every((item) => checkedItems.has(item.id));
  const allRequiredChecked = TERMS_ITEMS.filter((item) => item.required).every((item) =>
    checkedItems.has(item.id),
  );

  const selectedTerm = TERMS_ITEMS.find((item) => item.id === selectedTermId);

  function handleToggleAll() {
    if (allChecked) {
      setCheckedItems(new Set());
    } else {
      setCheckedItems(new Set(TERMS_ITEMS.map((item) => item.id)));
    }
  }

  function handleToggleItem(id: string) {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleAgree() {
    onAgree();
    onOpenChange(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setCheckedItems(new Set());
      setSelectedTermId(null);
    }
    onOpenChange(nextOpen);
  }

  // 상세 뷰
  if (selectedTerm) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent showCloseButton={false} className="w-full max-w-[640px]">
          <DialogHeader>
            <button
              type="button"
              onClick={() => setSelectedTermId(null)}
              className="cursor-pointer"
            >
              <Icon src={ArrowLeftIcon} size={12} alt="뒤로 가기" className="text-icon-normal" />
            </button>
          </DialogHeader>
          <DialogBody className="max-h-[400px]">
            <h2 className="typo-h3 text-text-strong">{selectedTerm.label}</h2>
            <p className="typo-body2 text-text-normal whitespace-pre-wrap">
              {selectedTerm.content}
            </p>
          </DialogBody>
          <DialogFooter showDivider>
            <Button variant="secondary" size="lg" onClick={() => setSelectedTermId(null)}>
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // 목록 뷰
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton className="w-full max-w-[640px]">
        <DialogHeader title="이용 및 정보 제공 약관" />
        <DialogBody>
          {/* 전체 동의 */}
          <button
            type="button"
            onClick={handleToggleAll}
            className="flex cursor-pointer items-center gap-300"
          >
            <Icon
              src={CheckRoundIcon}
              size={24}
              alt="전체 동의"
              className={cn(allChecked ? 'text-brand-primary' : 'text-icon-disabled')}
            />
            <span className="typo-sub2 text-text-strong">모두 확인하였고 이에 동의합니다.</span>
          </button>
          <p className="typo-caption2 text-text-alternative pl-[36px]">{TERMS_DESCRIPTION}</p>

          <Divider className="my-100" />

          {/* 개별 약관 항목 */}
          {TERMS_ITEMS.map((item, index) => {
            const isChecked = checkedItems.has(item.id);
            return (
              <div key={item.id} className="flex flex-col gap-300">
                {index > 0 && <Divider />}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleToggleItem(item.id)}
                    className="flex cursor-pointer items-center gap-300"
                  >
                    <Icon
                      src={CheckRoundIcon}
                      size={24}
                      alt={isChecked ? '선택됨' : '선택 안됨'}
                      className={cn(isChecked ? 'text-brand-primary' : 'text-icon-disabled')}
                    />
                    <span className="typo-sub2 text-text-normal">
                      {item.label}
                      {item.required && (
                        <span className="text-text-normal typo-sub2 ml-100">(필수)</span>
                      )}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTermId(item.id)}
                    className="cursor-pointer p-100"
                  >
                    <Icon
                      src={ArrowRightIcon}
                      size={12}
                      alt="상세 보기"
                      className="text-icon-alternative"
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </DialogBody>
        <DialogFooter showDivider>
          <Button variant="primary" size="lg" disabled={!allRequiredChecked} onClick={handleAgree}>
            동의 및 계속
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { TermsAgreementModal, type TermsAgreementModalProps };
