'use client';

import { Button } from '@/components/ui/Button';
import type { MemberPositionColor } from '@/constants/admin/memberPosition';
import type { MemberPositionOption } from '@/types/admin/memberPosition';
import { PositionColorPicker } from './PositionColorPicker';
import { PositionNameInput } from './PositionNameInput';

interface MemberPositionOptionRowProps {
  option: MemberPositionOption;
  index: number;
  usedColors: MemberPositionColor[];
  disabled: boolean;
  onChange: (patch: Partial<Pick<MemberPositionOption, 'name' | 'color'>>) => void;
  onDelete: () => void;
}

function MemberPositionOptionRow({
  option,
  index,
  usedColors,
  disabled,
  onChange,
  onDelete,
}: MemberPositionOptionRowProps) {
  return (
    <div className="bg-container-neutral max-tablet:gap-[10px] max-tablet:px-300 max-tablet:py-300 flex items-center gap-4 px-500 py-400">
      <PositionColorPicker
        value={option.color}
        usedColors={usedColors}
        label={`옵션 ${index + 1} 색상`}
        disabled={disabled}
        onChange={(color) => onChange({ color })}
      />
      <PositionNameInput
        label={`옵션 ${index + 1} 이름`}
        value={option.name}
        disabled={disabled}
        onChange={(name) => onChange({ name })}
      />
      <Button
        variant="secondary"
        size="lg"
        className="max-tablet:h-10 max-tablet:px-400 max-tablet:py-0 shrink-0"
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
