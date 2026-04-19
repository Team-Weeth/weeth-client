import { Icon } from '@/components/ui';
import { ArrowRightIcon, MoreHorizIcon } from '@/assets/icons';

function AttendanceLink({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-text-alternative flex cursor-pointer items-center gap-100 rounded-sm py-200"
    >
      <span className="typo-button2">출석 관리</span>
      <Icon src={ArrowRightIcon} alt="출석 관리" size={8} />
    </button>
  );
}

function MoreButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="더보기"
      className="flex cursor-pointer items-center justify-center rounded-sm p-200"
    >
      <Icon src={MoreHorizIcon} alt="더보기" size={24} className="text-text-alternative" />
    </button>
  );
}

export { AttendanceLink, MoreButton };
