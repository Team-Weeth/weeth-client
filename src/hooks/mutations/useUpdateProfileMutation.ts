import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mypageApi } from '@/lib/apis/mypage';
import { uploadFile } from '@/lib/apis/upload';
import type { UpdateUserBody, UpdateClubProfileBody } from '@/lib/apis/mypage';
import { useClubId } from '@/stores/useClubStore';
import { useUserStore } from '@/stores/useUserStore';

interface UpdateProfileParams {
  clubId?: string;
  user: UpdateUserBody;
  clubProfile: Omit<UpdateClubProfileBody, 'profileImage'>;
  profileImageFile?: File | null;
  resetImage?: boolean;
}

const isCompleteProfile = (user: UpdateUserBody) =>
  Boolean(
    user.name.trim() &&
    user.email.trim() &&
    user.tel.trim() &&
    user.school.trim() &&
    user.department.trim() &&
    user.studentId.trim(),
  );

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
    onSuccess: async ({ isReset }, { clubId: mutationClubId, user, clubProfile }) => {
      const targetClubId = mutationClubId ?? clubId;
      if (!targetClubId) return;

      queryClient.setQueryData(
        ['mypage', 'me', targetClubId],
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

      queryClient.setQueryData(
        ['home', 'profile-status', targetClubId],
        (
          old:
            | { cardinalAssigned: boolean; profileCompleted: boolean; missingFields: string[] }
            | undefined,
        ) => {
          if (!old) return old;

          const profileCompleted = isCompleteProfile(user);
          return {
            ...old,
            profileCompleted,
            missingFields: profileCompleted ? [] : old.missingFields,
          };
        },
      );

      await queryClient.invalidateQueries({ queryKey: ['home', targetClubId] });
      await queryClient.invalidateQueries({ queryKey: ['home', 'profile-status', targetClubId] });
      void queryClient.invalidateQueries({ queryKey: ['home', 'recent-posts', targetClubId] });
      void queryClient.invalidateQueries({ queryKey: ['posts', targetClubId] });

      if (isReset) {
        void queryClient.invalidateQueries({ queryKey: ['mypage', 'me', targetClubId] });
        return;
      }

      try {
        const res = await queryClient.fetchQuery({
          queryKey: ['mypage', 'me', targetClubId],
          queryFn: () => mypageApi.getMe(targetClubId).then((r) => r.data.data),
          staleTime: 0,
        });
        useUserStore.setState(
          { name: res.name, profileImageUrl: res.profileImageUrl },
          false,
          'syncProfile',
        );
      } catch {
        void queryClient.invalidateQueries({ queryKey: ['mypage', 'me', targetClubId] });
      }
    },
  });
}
