'use client';

import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import AdminBackIcon from '@/assets/icons/admin/ic_admin_back.svg';

interface AdminScheduleMobileBackHeaderProps {
  title: string;
  onBack: () => void;
  className?: string;
}

/** 모바일 일정 관리 하위 화면(월 이동·일정 상세·참석자 목록)의 뒤로 가기 + 제목 헤더. */
function AdminScheduleMobileBackHeader({
  title,
  onBack,
  className,
}: AdminScheduleMobileBackHeaderProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 flex-col items-start gap-100 self-stretch px-200 py-300',
        className,
      )}
    >
      <div className="flex items-center">
        {/* 32px 터치 영역 가운데에 아이콘을 두면, 좌측 8px 여백과 합쳐 본문(18px)과 정렬된다. */}
        <button
          type="button"
          aria-label="뒤로 가기"
          className="flex size-8 cursor-pointer items-center justify-center"
          onClick={onBack}
        >
          <Icon src={AdminBackIcon} size={24} className="text-icon-normal" />
        </button>
        {/* 디자인은 default Sub1(18px). 어드민 영역에는 18px 타이포가 없어 크기를 직접 지정한다. */}
        <h1 className="text-text-normal text-[18px] leading-[22px] font-semibold tracking-(--letter-spacing)">
          {title}
        </h1>
      </div>
    </div>
  );
}

export { AdminScheduleMobileBackHeader, type AdminScheduleMobileBackHeaderProps };
