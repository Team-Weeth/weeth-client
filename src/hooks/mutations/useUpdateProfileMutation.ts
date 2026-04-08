import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mypageApi } from '@/lib/apis/mypage';
import { fileApi } from '@/lib/apis/file';
import type { UpdateUserBody, UpdateClubProfileBody } from '@/lib/apis/mypage';
import { useClubId } from '@/stores/useClubStore';

interface UpdateProfileParams {
  user: UpdateUserBody;
  clubProfile: Omit<UpdateClubProfileBody, 'profileImage'>;
  profileImageFile?: File | null;
}

async function uploadProfileImage(file: File) {
  const res = await fileApi.getPresignedUrls('CLUB_MEMBER_PROFILE', [file.name]);
  const presigned = res.data.data[0];
  if (!presigned) {
    throw new Error('Presigned URL을 받지 못했습니다.');
  }

  const uploadRes = await fetch(presigned.putUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });

  if (!uploadRes.ok) {
    throw new Error('프로필 이미지 업로드에 실패했습니다.');
  }

  return {
    fileName: file.name,
    storageKey: presigned.storageKey,
    fileSize: file.size,
    contentType: file.type,
  };
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  const clubId = useClubId();

  return useMutation({
    mutationFn: async ({ user, clubProfile, profileImageFile }: UpdateProfileParams) => {
      const [, profileImage] = await Promise.all([
        mypageApi.updateUser(user),
        profileImageFile ? uploadProfileImage(profileImageFile) : undefined,
      ]);

      await mypageApi.updateClubProfile({
        bio: clubProfile.bio,
        ...(profileImage && { profileImage }),
      });
    },
    onSuccess: () => {
      if (clubId) {
        queryClient.invalidateQueries({ queryKey: ['mypage', 'me', clubId] });
      }
    },
  });
}
