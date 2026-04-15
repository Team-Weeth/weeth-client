import type { UploadResult } from '@/components/admin/club-info/ImageUploadField';
import type { ClubImagePayload, UpdateClubBody } from '@/lib/apis/adminClub';
import type { ClubInfoFormData } from '@/lib/schemas/clubInfo';
import type { ImageState } from '@/types/admin/clubInfo';
import type { Club } from '@/types/club';
import { formatPhone } from '@/utils/shared';

const EMPTY_FORM_VALUES: ClubInfoFormData = {
  school: '',
  name: '',
  description: '',
  phone: '',
  email: '',
  primaryContact: 'phone',
};

function toImagePayload(upload: UploadResult): ClubImagePayload {
  return {
    storageKey: upload.storageKey,
    fileName: upload.fileName,
    fileSize: upload.fileSize,
    contentType: upload.contentType,
  };
}

function getClubFormValues(club?: Club): ClubInfoFormData {
  if (!club) {
    return EMPTY_FORM_VALUES;
  }

  return {
    school: club.schoolName,
    name: club.name,
    description: club.description ?? '',
    phone: formatPhone(club.contactPhoneNumber ?? ''),
    email: club.contactEmail ?? '',
    primaryContact: club.primaryContact === 'EMAIL' ? 'email' : 'phone',
  };
}

function getImagePreviewUrl(image: ImageState, fallbackUrl?: string | null) {
  if (image.status === 'uploaded') {
    return image.upload.fileUrl;
  }

  if (image.status === 'deleted') {
    return null;
  }

  return fallbackUrl ?? null;
}

function buildUpdateClubBody(
  formData: ClubInfoFormData,
  profileImage: ImageState,
  backgroundImage: ImageState,
): UpdateClubBody {
  const body: UpdateClubBody = {
    name: formData.name,
    schoolName: formData.school,
    description: formData.description,
    contactPhoneNumber: formData.phone.replace(/-/g, ''),
    contactEmail: formData.email,
    primaryContact: formData.primaryContact === 'email' ? 'EMAIL' : 'PHONE',
  };

  if (profileImage.status === 'uploaded') {
    body.profileImage = toImagePayload(profileImage.upload);
  }

  if (backgroundImage.status === 'uploaded') {
    body.backgroundImage = toImagePayload(backgroundImage.upload);
  }

  return body;
}

export { buildUpdateClubBody, getClubFormValues, getImagePreviewUrl };
