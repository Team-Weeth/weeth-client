'use server';

import { cookies } from 'next/headers';
import { updateTag } from 'next/cache';

import { apiServer } from '@/lib/apis/server';
import { CLUB_COOKIE_OPTIONS, CLUB_ID_KEY, CLUB_NAME_KEY } from '@/lib/apis/cookies';
import type { CreateClubFormData } from '@/lib/schemas/createClub';

export async function revalidateDashboard(clubId: string) {
  updateTag(`dashboard-${clubId}`);
}

export async function setClubCookie(clubId: string, clubName: string) {
  const cookieStore = await cookies();
  cookieStore.set(CLUB_ID_KEY, clubId, CLUB_COOKIE_OPTIONS);
  cookieStore.set(CLUB_NAME_KEY, clubName, CLUB_COOKIE_OPTIONS);
}

export async function createClubAction(data: CreateClubFormData) {
  const payload = {
    name: data.name,
    schoolName: data.school.replace(/\(.*\)$/, '').trim(),
    description: data.description,
    contactEmail: data.email || null,
    contactPhoneNumber: data.phone.replace(/-/g, ''),
    primaryContact: data.contactType.toUpperCase(),
    currentCardinal: Number(data.generation),
    profileImage: null,
    backgroundImage: null,
  };

  try {
    const result = await apiServer.post<{ data: { clubId: string; clubName: string } }>(
      '/clubs',
      payload,
    );
    const clubId = result?.data?.clubId;

    if (clubId) {
      await setClubCookie(clubId, data.name);
    }

    return { success: true, clubId: clubId ?? null };
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : '동아리 개설에 실패했습니다.';
    const message = rawMessage.includes('club.uk_club_school_name_club_name')
      ? '이미 해당 학교에 같은 이름의 동아리가 있습니다'
      : rawMessage;
    return { error: message };
  }
}
