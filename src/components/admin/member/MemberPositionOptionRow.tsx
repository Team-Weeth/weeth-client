'use client';

import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import type { MemberPositionColor } from '@/constants/admin/memberPosition';
import type { MemberPositionOption } from '@/types/admin/memberPosition';
import { PositionColorPicker } from './PositionColorPicker';
import { PositionNameInput } from './PositionNameInput';

interface MemberPositionOptionRowProps {
  mobile?: boolean;
  option: MemberPositionOption;
  index: number;
  usedColors: MemberPositionColor[];
  disabled: boolean;
  onChange: (patch: Partial<Pick<MemberPositionOption, 'name' | 'color'>>) => void;
  onDelete: () => void;
}

function MemberPositionOptionRow({
  mobile = false,
  option,
  index,
  usedColors,
  disabled,
  onChange,
  onDelete,
}: MemberPositionOptionRowProps) {
  return (
    <div
      className={cn(
        'bg-container-neutral flex items-center gap-4 px-500 py-400',
        mobile && 'gap-[10px] px-300 py-300',
      )}
    >
      <PositionColorPicker
        mobile={mobile}
        value={option.color}
        usedColors={usedColors}
        label={`옵션 ${index + 1} 색상`}
        disabled={disabled}
        onChange={(color) => onChange({ color })}
      />
      <PositionNameInput
        mobile={mobile}
        label={`옵션 ${index + 1} 이름`}
        value={option.name}
        disabled={disabled}
        onChange={(name) => onChange({ name })}
      />
      <Button
        variant="secondary"
        size="lg"
        className={cn('shrink-0', mobile && 'h-10 px-400 py-0')}
        disabled={disabled}
        aria-label={`옵션 ${index + 1} 삭제`}
        onClick={onDelete}
      >
        삭제
      </Button>
    </div>
  );
}

export { MemberPositionOptionRow };
