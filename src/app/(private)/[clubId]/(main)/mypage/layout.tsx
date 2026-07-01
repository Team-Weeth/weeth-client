import { MyPageNav } from '@/components/mypage/MyPageNav';

interface MyPageLayoutProps {
  children: React.ReactNode;
}

export default function MyPageLayout({ children }: MyPageLayoutProps) {
  return (
    <div className="mx-auto flex w-full items-start gap-500 px-16 pt-450 pb-[80px]">
      <aside className="tablet:flex hidden shrink-0">
        <MyPageNav />
      </aside>
      <div className="flex min-w-0 flex-1">{children}</div>
    </div>
  );
}
