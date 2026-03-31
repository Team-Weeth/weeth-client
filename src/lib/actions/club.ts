'use server';

import { apiServer } from '@/lib/apis/server';
import type { CreateClubFormData } from '@/lib/schemas/createClub';

export async function createClubAction(data: CreateClubFormData) {
  const payload = {
    name: data.name,
    schoolName: data.school,
    description: data.description,
    contactEmail: data.email || null,
    contactPhoneNumber: data.phone.replace(/-/g, ''),
    primaryContact: data.contactType.toUpperCase(),
    currentCardinal: Number(data.generation),
    profileImage: null,
    backgroundImage: null,
  };

  try {
    await apiServer.post('/clubs', payload);
  } catch (error) {
    console.error('createClubAction failed:', error);
    return { error: '동아리 개설에 실패했습니다.' };
  }

  return { success: true };
}
