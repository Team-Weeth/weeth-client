import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui/Icon';
import ArrowRightIcon from '@/assets/icons/arrow_right.svg';
import MoreHorizIcon from '@/assets/icons/more-horiz.svg';
import type { SessionStatus } from '@/types/admin/session';

function AttendanceLink({ status, onClick }: { status: SessionStatus; onClick?: () => void }) {
  // 예정/취소 상태는 출석 관리 진입 불가 → 버튼 자체를 숨김
  if (status === 'SCHEDULED' || status === 'CANCELED') return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex cursor-pointer items-center gap-100 rounded-sm py-200',
        status === 'OPEN' ? 'text-text-normal' : 'text-text-alternative',
      )}
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
