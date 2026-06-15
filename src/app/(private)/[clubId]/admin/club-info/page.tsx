import { unstable_rethrow } from 'next/navigation';

import { ClubInfoPageContent } from '@/components/admin';
import { universityServerApi } from '@/lib/apis/university.server';
import { deduplicateSchoolNames } from '@/utils/shared/school';

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
