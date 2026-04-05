import { CreateClubForm } from '@/components/auth/hub';
import { apiServer } from '@/lib/apis';

interface School {
  schoolName: string;
  region: string;
}

export default async function CreateClubPage() {
  try {
    const json = await apiServer.get<{ data: School[] }>('/university/schools');
    const schools = json.data;
    const counts = schools.reduce<Record<string, number>>((acc, s) => {
      acc[s.schoolName] = (acc[s.schoolName] ?? 0) + 1;
      return acc;
    }, {});
    const schoolNames = schools.map((s) =>
      counts[s.schoolName] > 1 ? `${s.schoolName}(${s.region})` : s.schoolName,
    );

    return <CreateClubForm schoolNames={schoolNames} />;
  } catch {
    return <CreateClubForm schoolNames={[]} schoolLoadError />;
  }
}
