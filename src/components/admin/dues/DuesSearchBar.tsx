import SearchIcon from '@/assets/icons/search.svg';
import { Icon } from '@/components/ui';

interface DuesSearchBarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

function DuesSearchBar({ searchQuery, setSearchQuery }: DuesSearchBarProps) {
  return (
    <div className="bg-container-neutral-alternative relative h-[48px] w-full max-w-[339px] overflow-hidden rounded-sm">
      <div className="text-icon-alternative absolute top-1/2 left-400 flex -translate-y-1/2 self-center">
        <Icon src={SearchIcon} alt="" size={24} />
      </div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="이름으로 검색하기"
        aria-label="이름으로 검색하기"
        className="typo-body2 placeholder:text-text-alternative text-text-strong h-full w-full bg-transparent pr-400 pl-[52px] outline-none"
      />
    </div>
  );
}

export { DuesSearchBar, type DuesSearchBarProps };
