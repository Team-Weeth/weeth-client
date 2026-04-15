'use client';

import { useRouter } from 'next/navigation';
import { CompleteIcon } from '@/assets/icons';
import Image from 'next/image';

export function AlertBanner() {
  const router = useRouter();

  return (
    <button
      type="button"
      className="bg-container-primary-alternative mt-300 flex w-full cursor-pointer gap-[10px] rounded-md p-300 text-left"
      onClick={() => router.push('/mypage')}
    >
      <Image src={CompleteIcon} width={40} height={40} alt="complete" />
      <div className="flex flex-col gap-100">
        <p className="typo-sub3 text-text-normal">나의 프로필을 완성하세요!</p>
        <p className="typo-body2 text-text-alternative">완성하고 게시글을 작성해요.</p>
      </div>
    </button>
  );
}
