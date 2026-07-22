'use client';

import { useState } from 'react';
import { Popover } from 'radix-ui';

import { cn } from '@/lib/cn';
import { BANK_LIST } from '@/constants/admin/bank.constants';
import { AdminScopeBoundary } from '@/providers';
import { Icon } from '@/components/ui';
import { ArrowDownIcon } from '@/assets/icons';
import { ScheduleFormField } from '@/components/admin/schedule/general/ScheduleFormField';

interface BankSelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
}

function BankSelectField({
  label,
  value,
  onChange,
  placeholder = '은행을 선택해주세요',
  error,
  className,
}: BankSelectFieldProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = query
    ? BANK_LIST.filter((bank) => bank.toLowerCase().includes(query.toLowerCase()))
    : BANK_LIST;

  const handleSelect = (bank: string) => {
    onChange(bank);
    setOpen(false);
    setQuery('');
  };

  return (
    <ScheduleFormField label={label}>
      <Popover.Root
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery('');
        }}
      >
        <Popover.Trigger asChild>
          <button
            type="button"
            className={cn(
              'typo-body1 flex h-12 w-full items-center justify-between rounded-sm px-400 py-300 focus:outline-none',
              value ? 'text-text-normal' : 'text-text-alternative',
              error && 'ring-state-error ring-1',
              className,
            )}
          >
            <span className="truncate">{value || placeholder}</span>
            <Icon
              src={ArrowDownIcon}
              size={20}
              alt="은행 목록 열기"
              className={cn(
                'text-icon-alternative transition-transform',
                open && 'rotate-180',
              )}
            />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <AdminScopeBoundary>
            <Popover.Content
              align="start"
              sideOffset={4}
              className={cn(
                'bg-container-neutral z-90 flex w-(--radix-popover-trigger-width) flex-col overflow-hidden rounded-md shadow-[0px_4px_14px_0px_rgba(0,0,0,0.25)]',
                'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
                'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
              )}
            >
              <div className="p-200">
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="은행 검색"
                  className="bg-container-neutral-alternative typo-body2 placeholder:text-text-alternative text-text-normal h-10 w-full rounded-sm px-300 focus:outline-none"
                />
              </div>

              <ul className="max-h-60 overflow-y-auto pb-100">
                {filtered.length === 0 ? (
                  <li className="typo-body2 text-text-alternative flex h-10 items-center px-400">
                    검색 결과가 없습니다
                  </li>
                ) : (
                  filtered.map((bank) => (
                    <li key={bank}>
                      <button
                        type="button"
                        onClick={() => handleSelect(bank)}
                        className={cn(
                          'typo-body1 hover:bg-container-neutral-interaction flex h-10 w-full items-center px-400 text-left',
                          bank === value ? 'text-text-strong' : 'text-text-normal',
                        )}
                      >
                        {bank}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </Popover.Content>
          </AdminScopeBoundary>
        </Popover.Portal>
      </Popover.Root>

      {error && (
        <div className="mt-100 px-100">
          <span className="typo-caption2 text-state-error">{error}</span>
        </div>
      )}
    </ScheduleFormField>
  );
}

export { BankSelectField, type BankSelectFieldProps };
