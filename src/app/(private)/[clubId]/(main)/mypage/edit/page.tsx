import { EditProfileContent } from '@/components/mypage/edit/EditProfileContent';
import { universityServerApi } from '@/lib/apis/university.server';

export const dynamic = 'force-dynamic';

export default async function EditProfilePage() {
  const [schoolsRes, majorsRes] = await Promise.all([
    universityServerApi.getSchools(),
    universityServerApi.getMajors(),
  ]);

  const schoolCounts = schoolsRes.data.reduce<Record<string, number>>((acc, s) => {
    acc[s.schoolName] = (acc[s.schoolName] ?? 0) + 1;
    return acc;
  }, {});
  const schools = schoolsRes.data.map((s) =>
    schoolCounts[s.schoolName] > 1 ? `${s.schoolName}(${s.region})` : s.schoolName,
  );
  const majors = majorsRes.data.map((m) => m.majorName);

  return <EditProfileContent schools={schools} majors={majors} />;
}
