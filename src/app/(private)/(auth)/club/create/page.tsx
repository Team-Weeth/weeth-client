import { CreateClubForm } from '@/components/auth/hub';
import { universityServerApi } from '@/lib/apis/university.server';

export default async function CreateClubPage() {
  let schoolNames: string[] = [];
  let schoolLoadError = false;

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
  } catch {
    schoolLoadError = true;
  }

  return <CreateClubForm schoolNames={schoolNames} schoolLoadError={schoolLoadError} />;
}
