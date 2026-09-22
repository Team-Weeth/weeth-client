'use client';

import { useParams, useRouter } from 'next/navigation';

/** 포지션 옵션이 하나도 없을 때 드롭다운의 '추가하기'가 부원 정보 설정 페이지로 보낸다. */
export function useMemberPositionSettingsLink() {
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();

  return () => router.push(`/${clubId}/admin/member/position-settings`);
}
