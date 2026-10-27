import type { Metadata } from 'next';
import { unstable_rethrow } from 'next/navigation';

import { ClubInfoPageContent } from '@/components/admin/club-info/ClubInfoPageContent';
import { universityServerApi } from '@/lib/apis/university.server';
import { deduplicateSchoolNames } from '@/utils/shared/school';

export const metadata: Metadata = { title: '운영진 · 동아리 정보' };

export default async function ClubInfoPage() {
  let schoolNames: string[] = [];

  try {
    const json = await universityServerApi.getSchools();
    schoolNames = deduplicateSchoolNames(json.data);
  } catch (error) {
    unstable_rethrow(error);
    console.error('학교 목록 로드 실패:', error);
  }

  return <ClubInfoPageContent schoolNames={schoolNames} />;
}
