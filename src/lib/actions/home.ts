'use server';

import { updateTag } from 'next/cache';

export async function revalidateHomeDashboard(clubId: string) {
  updateTag(`dashboard-${clubId}`);
}
