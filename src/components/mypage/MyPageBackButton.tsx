'use client';

import BackIcon from '@/assets/icons/back.svg';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

interface MyPageBackButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: React.Ref<HTMLButtonElement>;
}

/**
 * 마이페이지 하위 화면 제목줄의 뒤로가기 버튼 (Figma PageNavigation_v4의 32px button-onlyIcon).
 * 모바일에서는 버튼 안쪽 여백만큼 왼쪽으로 당겨 꺾쇠를 본문 왼쪽 끝에 맞춘다.
 * 제목과의 간격은 모바일 0, 태블릿 이상 4px이라 감싸는 줄에 `tablet:gap-1`을 준다.
 */
function MyPageBackButton({ className, ref, ...props }: MyPageBackButtonProps) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label="뒤로가기"
      className={cn(
        'tablet:ml-0 -ml-[10px] flex size-8 shrink-0 cursor-pointer items-center justify-center',
        className,
      )}
      {...props}
    >
      <Icon src={BackIcon} size={17} className="text-icon-normal" />
    </button>
  );
}

export { MyPageBackButton, type MyPageBackButtonProps };
