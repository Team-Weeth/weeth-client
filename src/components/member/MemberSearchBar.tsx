import { useRef } from 'react';
import { Icon } from '@/components/ui/Icon';
import SearchIcon from '@/assets/icons/search.svg';
import AdminCloseIcon from '@/assets/icons/admin/ic_admin_close.svg';

interface MemberSearchBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onValueChange: (value: string) => void;
}

function MemberSearchBar({ value, onValueChange }: MemberSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    onValueChange('');
  };

  return (
    <div className="border-line bg-container-neutral flex items-center rounded-[10px] border px-[10px] py-[7px] focus-within:border-neutral-800">
      <Icon src={SearchIcon} size={16} className="text-icon-alternative" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder="이름을 검색해 보세요"
        className="typo-body2 text-text-normal placeholder:text-text-disabled w-[259px] min-w-0 flex-1 bg-transparent py-[2px] pl-200 focus:outline-none"
        tabIndex={0}
      />
      <button
        type="button"
        aria-label="검색어 지우기"
        className="text-icon-alternative hover:text-icon-strong flex size-[18px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-sm opacity-100 transition-[width,height,opacity,color]"
        onClick={handleClose}
      >
        <Icon src={AdminCloseIcon} size={14} />
      </button>
    </div>
  );
}

export { MemberSearchBar, type MemberSearchBarProps };
