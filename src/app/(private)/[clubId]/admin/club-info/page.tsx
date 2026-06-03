import { unstable_rethrow } from 'next/navigation';

import { ClubInfoPageContent } from '@/components/admin';
import { universityServerApi } from '@/lib/apis/university.server';

export default async function ClubInfoPage() {
  let schoolNames: string[] = [];

  try {
    const json = await universityServerApi.getSchools();
    const schools = json.data;
    const counts = schools.reduce<Record<string, number>>((acc, s) => {
      acc[s.schoolName] = (acc[s.schoolName] ?? 0) + 1;
      return acc;
    }, {});
    schoolNames = schools.map((s) =>
      counts[s.schoolName] > 1 ? `${s.schoolName}(${s.region})` : s.schoolName,
    );
  } catch (error) {
    unstable_rethrow(error);
    console.error('학교 목록 로드 실패:', error);
  }

  return <ClubInfoPageContent schoolNames={schoolNames} />;
}
