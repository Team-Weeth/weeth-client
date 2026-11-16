import type { Metadata } from 'next';
import { CreateClubForm } from '@/components/auth/hub/CreateClubForm';
import { universityServerApi } from '@/lib/apis/university.server';
import { deduplicateSchoolNames } from '@/utils/shared/school';

export const metadata: Metadata = { title: '동아리 개설' };

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
