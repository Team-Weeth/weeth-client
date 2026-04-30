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
  resetImage?: boolean;
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  const clubId = useClubId();

  return useMutation({
    mutationFn: async ({
      user,
      clubProfile,
      profileImageFile,
      resetImage,
    }: UpdateProfileParams) => {
      const [, profileImage] = await Promise.all([
        mypageApi.updateUser(user),
        profileImageFile ? uploadFile(profileImageFile, 'CLUB_MEMBER_PROFILE') : undefined,
      ]);

      await Promise.all([
        mypageApi.updateClubProfile({
          bio: clubProfile.bio,
          ...(profileImage ? { profileImage } : {}),
        }),
        resetImage ? mypageApi.deleteProfileImage() : undefined,
      ]);

      return { isReset: !!resetImage };
    },
    onSuccess: async ({ isReset }, { user, clubProfile }) => {
      if (!clubId) return;

      queryClient.setQueryData(
        ['mypage', 'me', clubId],
        (old: Record<string, unknown> | undefined) => {
          if (!old) return old;
          return {
            ...old,
            name: user.name,
            email: user.email,
            school: user.school,
            department: user.department,
            studentId: user.studentId,
            tel: user.tel,
            bio: clubProfile.bio,
            ...(isReset && { profileImageUrl: null }),
          };
        },
      );

      useUserStore.setState(
        { name: user.name, ...(isReset && { profileImageUrl: null }) },
        false,
        'syncProfile',
      );

      void queryClient.invalidateQueries({ queryKey: ['home', clubId] });
      void queryClient.invalidateQueries({ queryKey: ['home', 'profile-status', clubId] });
      void queryClient.invalidateQueries({ queryKey: ['home', 'recent-posts', clubId] });
      void queryClient.invalidateQueries({ queryKey: ['posts', clubId] });

      if (isReset) {
        void queryClient.invalidateQueries({ queryKey: ['mypage', 'me', clubId] });
        return;
      }

      try {
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
      } catch {
        void queryClient.invalidateQueries({ queryKey: ['mypage', 'me', clubId] });
      }
    },
  });
}
