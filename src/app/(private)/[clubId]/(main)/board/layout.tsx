import type { ReactNode } from 'react';

import { BackOrHomeButton, MobileBlocker } from '@/components/ui';

export default async function BoardLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{ clubId: string }>;
}>) {
  const { clubId } = await params;

  return (
    <>
      <div className="tablet:hidden">
        <MobileBlocker
          action={
            <BackOrHomeButton fallbackHref={`/${clubId}/home`}>
              이전 페이지로 돌아가기
            </BackOrHomeButton>
          }
        />
      </div>
      <div className="hidden tablet:contents">{children}</div>
    </>
  );
}
