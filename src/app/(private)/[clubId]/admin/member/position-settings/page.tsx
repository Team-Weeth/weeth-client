'use client';

import { MemberPositionContent } from '@/components/admin/member/MemberPositionContent';

/** 포지션 저장 API가 확정되면 onSave를 실제 저장 로직으로 교체한다. */
export default function PositionSettingsPage() {
  return <MemberPositionContent onSave={() => {}} />;
}
