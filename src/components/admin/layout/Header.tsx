'use client';

import { usePathname } from 'next/navigation';

const PAGE_METADATA: Record<string, { title: string; description: string }> = {
  '/admin/member': {
    title: '멤버 관리',
    description:
      '가입 승인 등 멤버를 관리하는 페이지입니다. 정기모임을 모두 입력하신 후에 가입 승인을 해주시길 바랍니다.',
  },
  '/admin/attendance': {
    title: '출석 관리',
    description: '기수를 선택하고, 해당 모임에 대한 출석을 수정하는 페이지입니다.',
  },
  '/admin/penalty': {
    title: '페널티 관리',
    description: '기수를 선택하고, 해당 멤버에 대한 페널티를 수정하는 페이지입니다.',
  },
  '/admin/dues': {
    title: '회비 관리',
    description:
      '기수 시작시 이월된 회비와 해당 기수 회비를 종합해 회비를 등록해주시기 바랍니다. 회비 등록은 기수당 한 번만 가능합니다.',
  },
};

export function Header() {
  const pathname = usePathname();

  const metadata = Object.entries(PAGE_METADATA).find(([path]) => pathname.startsWith(path))?.[1];

  return (
    <header className="border-line bg-background flex h-15 w-full shrink-0 items-center gap-300 border-b px-500">
      {metadata && (
        <>
          <div className="border-line h-5 w-px shrink-0" />
          <span className="typo-sub1 text-text-strong shrink-0">{metadata.title}</span>
          <span className="typo-body2 text-text-alternative min-w-0 truncate">
            {metadata.description}
          </span>
        </>
      )}

      <button className="border-line typo-button2 bg-button-neutral text-text-strong hover:bg-container-neutral-interaction ml-auto shrink-0 cursor-pointer rounded-sm border px-300 py-200">
        Logout
      </button>
    </header>
  );
}
