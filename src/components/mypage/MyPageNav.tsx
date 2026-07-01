'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

const NAV_ITEMS = [
  { id: 'profile', label: '프로필', href: '/mypage' },
  { id: 'activity', label: '활동정보', href: '/mypage/activity' },
  { id: 'settings', label: '서비스 설정', href: '/mypage/settings' },
] as const;

function MyPageNav({ className, ...props }: React.ComponentProps<'nav'>) {
  const pathname = usePathname();
  const { clubId } = useParams<{ clubId: string }>();

  return (
    <nav
      className={cn('bg-container-neutral flex w-[304px] flex-col rounded-lg', className)}
      aria-label="마이페이지"
      {...props}
    >
      <h2 className="typo-sub1 text-text-strong px-450 pt-450 pb-300">마이페이지</h2>
      <ul className="flex flex-col gap-200 px-450 py-400" role="list">
        {NAV_ITEMS.map((item) => {
          const href = `/${clubId}${item.href}`;
          const isProfileSubPath =
            pathname.startsWith(`/${clubId}/mypage/profiles`) ||
            pathname.startsWith(`/${clubId}/mypage/edit`) ||
            pathname.startsWith(`/${clubId}/mypage/posts`) ||
            pathname.startsWith(`/${clubId}/mypage/sessions`);
          const isActive = pathname === href || (item.id === 'profile' && isProfileSubPath);
          return (
            <li key={item.id}>
              <Link
                href={href}
                className={cn(
                  'typo-button1 block w-full rounded-md px-300 py-200 text-left',
                  isActive
                    ? 'bg-container-primary text-text-inverse'
                    : 'text-text-normal hover:bg-container-neutral-interaction',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export { MyPageNav };
