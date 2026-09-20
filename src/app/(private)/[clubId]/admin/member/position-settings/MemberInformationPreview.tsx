'use client';

import { useState } from 'react';
import { MemberInformationContent } from '@/components/admin/member/MemberInformationContent';
import { MemberPositionTag } from '@/components/admin/member/MemberPositionTag';
import type { MemberPositionOption } from '@/components/admin/member/MemberPositionEditor';
import { toastInfo } from '@/stores/useToastStore';

export function MemberInformationPreview() {
  const [savedOptions, setSavedOptions] = useState<MemberPositionOption[]>([]);
  return (
    <div className="bg-container-neutral flex min-h-full min-w-0 flex-col rounded-t-lg">
      <MemberInformationContent
        className="min-h-0 flex-1"
        onSave={(options) => {
          setSavedOptions(options);
          toastInfo('미리보기입니다. 변경 사항은 서버에 저장되지 않습니다.');
        }}
      />
      {savedOptions.length > 0 && (
        <section
          aria-label="저장한 포지션 태그 미리보기"
          className="flex flex-wrap items-center gap-200 p-700"
        >
          <span className="typo-body1 text-text-alternative">태그 미리보기</span>
          {savedOptions.map((option) => (
            <MemberPositionTag key={option.id} color={option.color}>
              {option.name}
            </MemberPositionTag>
          ))}
        </section>
      )}
    </div>
  );
}
