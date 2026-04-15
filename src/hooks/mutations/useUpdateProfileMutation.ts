import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mypageApi } from '@/lib/apis/mypage';
import { uploadFile } from '@/lib/apis/upload';
import type { UpdateUserBody, UpdateClubProfileBody } from '@/lib/apis/mypage';
import { useClubId } from '@/stores/useClubStore';
import { useUserStore } from '@/stores/useUserStore';

interface UpdateProfileParams {
  user: UpdateUserBody;
  clubProfile: Omit<UpdateClubProfileBody, 'profileImage'>;
  profileImageFile?: File | null;
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  const clubId = useClubId();

  return useMutation({
    mutationFn: async ({ user, clubProfile, profileImageFile }: UpdateProfileParams) => {
      const [, profileImage] = await Promise.all([
        mypageApi.updateUser(user),
        profileImageFile ? uploadFile(profileImageFile, 'CLUB_MEMBER_PROFILE') : undefined,
      ]);

      await mypageApi.updateClubProfile({
        bio: clubProfile.bio,
        ...(profileImage && { profileImage }),
      });
    },
    onSuccess: async () => {
      if (!clubId) return;

      const res = await queryClient.fetchQuery({
        queryKey: ['mypage', 'me', clubId],
        queryFn: () => mypageApi.getMe(clubId).then((r) => r.data.data),
        staleTime: 0,
      });

      useUserStore.setState(
        { name: res.name, profileImageUrl: res.profileImageUrl },
        false,
        'syncProfile',
      );
    },
  });
}
