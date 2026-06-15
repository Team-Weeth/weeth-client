import type { School } from '@/lib/apis/university.server';

export function deduplicateSchoolNames(schools: School[]): string[] {
  const counts = schools.reduce<Record<string, number>>((acc, s) => {
    acc[s.schoolName] = (acc[s.schoolName] ?? 0) + 1;
    return acc;
  }, {});
  return schools.map((s) =>
    counts[s.schoolName] > 1 ? `${s.schoolName}(${s.region})` : s.schoolName,
  );
}
