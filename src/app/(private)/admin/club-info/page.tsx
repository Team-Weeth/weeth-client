import { ClubInfoPageContent } from '@/components/admin';
import { apiServer } from '@/lib/apis';

interface School {
  schoolName: string;
  region: string;
}

export default async function ClubInfoPage() {
  let schoolNames: string[] = [];

  try {
    const json = await apiServer.get<{ data: School[] }>('/university/schools');
    const schools = json.data;
    const counts = schools.reduce<Record<string, number>>((acc, s) => {
      acc[s.schoolName] = (acc[s.schoolName] ?? 0) + 1;
      return acc;
    }, {});
    schoolNames = schools.map((s) =>
      counts[s.schoolName] > 1 ? `${s.schoolName}(${s.region})` : s.schoolName,
    );
  } catch {
    // 학교 목록 로드 실패 시 빈 배열 유지
  }

  return <ClubInfoPageContent schoolNames={schoolNames} />;
}
