import { CreateClubForm } from '@/components/auth/hub/CreateClubForm';
import { universityServerApi } from '@/lib/apis/university.server';
import { deduplicateSchoolNames } from '@/utils/shared/school';

export default async function CreateClubPage() {
  let schoolNames: string[] = [];
  let schoolLoadError = false;

  try {
    const json = await universityServerApi.getSchools();
    schoolNames = deduplicateSchoolNames(json.data);
  } catch {
    schoolLoadError = true;
  }

  return <CreateClubForm schoolNames={schoolNames} schoolLoadError={schoolLoadError} />;
}
