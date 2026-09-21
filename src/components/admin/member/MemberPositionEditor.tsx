'use client';

import { useId } from 'react';
import AddRoundIcon from '@/assets/icons/add_round.svg';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { MAX_POSITION_OPTIONS } from '@/constants/admin/memberPosition';
import type { MemberPositionEditorOptions } from '@/types/admin/memberPosition';
import { cn } from '@/lib/cn';
import { MemberPositionOptionRow } from './MemberPositionOptionRow';
import { useMemberPositionEditor } from './hooks/useMemberPositionEditor';

interface MemberPositionEditorProps extends MemberPositionEditorOptions {
  className?: string;
}

function MemberPositionEditor({ initialOptions, onSave, className }: MemberPositionEditorProps) {
  const headingId = useId();
  const {
    options,
    saving,
    error,
    canSave,
    canAdd,
    hasDuplicateNames,
    updateOption,
    removeOption,
    addOption,
    getUsedColors,
    handleSave,
  } = useMemberPositionEditor({ initialOptions, onSave });

  return (
    <form
      className={cn('max-tablet:flex-1 flex min-w-0 flex-col gap-400', className)}
      onSubmit={(event) => {
        event.preventDefault();
        void handleSave();
      }}
    >
      <section
        aria-labelledby={headingId}
        className="bg-background max-tablet:bg-container-neutral max-tablet:rounded-none max-tablet:p-0 flex flex-col gap-400 rounded-lg p-600"
      >
        <div className="mb-200 flex flex-col gap-100">
          <h2 id={headingId} className="typo-h3 max-tablet:typo-sub1 text-text-strong">
            포지션
          </h2>
          <p className="typo-body1 max-tablet:typo-body2 text-text-alternative">
            해당 필드에 옵션을 설정해 두면 멤버 관리 표에서 볼 수 있습니다.
          </p>
        </div>
        <div className="border-line overflow-hidden rounded-sm border">
          <div className="bg-container-neutral-interaction typo-sub3 text-text-alternative px-400 py-400">
            선택 옵션
          </div>
          <div className="divide-line divide-y">
            {options.length === 0 && (
              <p className="bg-container-neutral typo-sub1 text-text-disabled flex items-center justify-center gap-4 px-500 py-700 text-center">
                옵션을 추가해 보세요.
              </p>
            )}
            {options.map((option, index) => (
              <MemberPositionOptionRow
                key={option.id}
                option={option}
                index={index}
                usedColors={getUsedColors(option.id)}
                disabled={saving}
                onChange={(patch) => updateOption(option.id, patch)}
                onDelete={() => removeOption(option.id)}
              />
            ))}
          </div>
        </div>
        <Button
          variant="secondary"
          size="md"
          className="w-full gap-100"
          disabled={!canAdd}
          onClick={addOption}
        >
          <span className="flex size-5 shrink-0 items-center justify-center" aria-hidden>
            <Icon src={AddRoundIcon} size={14} />
          </span>
          옵션 추가하기 ({options.length}/{MAX_POSITION_OPTIONS})
        </Button>
        {hasDuplicateNames && (
          <p role="alert" className="typo-caption1 text-state-error">
            옵션 이름은 서로 다르게 입력해주세요.
          </p>
        )}
      </section>
      {error && (
        <p role="alert" className="typo-body2 text-state-error">
          {error}
        </p>
      )}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="max-tablet:mt-auto max-tablet:min-h-12 max-tablet:w-full self-end"
        disabled={!canSave}
      >
        {saving ? '저장 중...' : '저장하기'}
      </Button>
    </form>
  );
}

export { MemberPositionEditor, type MemberPositionEditorProps };
export type { MemberPositionOption } from '@/types/admin/memberPosition';
export type { MemberPositionColor } from '@/constants/admin/memberPosition';
