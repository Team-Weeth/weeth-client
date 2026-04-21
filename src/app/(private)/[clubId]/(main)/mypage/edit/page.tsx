import { EditProfileContent } from '@/components/mypage';
import { universityServerApi } from '@/lib/apis/university.server';

export const dynamic = 'force-dynamic';

export default async function EditProfilePage() {
  const [schoolsRes, majorsRes] = await Promise.all([
    universityServerApi.getSchools(),
    universityServerApi.getMajors(),
  ]);

  const schools = schoolsRes.data.map((s) => s.schoolName);
  const majors = majorsRes.data.map((m) => m.majorName);

  return <EditProfileContent schools={schools} majors={majors} />;
}
