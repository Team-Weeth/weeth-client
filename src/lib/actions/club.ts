'use server';

import { apiServer } from '@/lib/apis/server';
import type { CreateClubFormData } from '@/lib/schemas/createClub';

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

  console.log('createClubAction payload:', payload);

  try {
    await apiServer.post('/clubs', payload);
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : '동아리 개설에 실패했습니다.';
    const message = rawMessage.includes('club.uk_club_school_name_club_name')
      ? '이미 해당 학교에 같은 이름의 동아리가 있습니다'
      : rawMessage;
    return { error: message };
  }

  return { success: true };
}
