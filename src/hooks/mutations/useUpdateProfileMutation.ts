import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mypageApi } from '@/lib/apis/mypage';
import { uploadFile } from '@/lib/apis/upload';
import type { UpdateUserBody, UpdateClubProfileBody } from '@/lib/apis/mypage';
import { useClubId } from '@/stores/useClubStore';
import { useUserStore } from '@/stores/useUserStore';

interface UpdateProfileParams {
  clubId?: string;
  user: UpdateUserBody;
  clubProfile?: Omit<UpdateClubProfileBody, 'profileImage'>;
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
      await mypageApi.updateUser(user);

      if (clubProfile || profileImageFile || resetImage) {
        const profileImage = profileImageFile
          ? await uploadFile(profileImageFile, 'CLUB_MEMBER_PROFILE')
          : undefined;

        await Promise.all([
          clubProfile
            ? mypageApi.updateClubProfile({
                bio: clubProfile.bio,
                ...(profileImage ? { profileImage } : {}),
              })
            : undefined,
          resetImage ? mypageApi.deleteProfileImage() : undefined,
        ]);
      }

      return { isReset: !!resetImage };
    },
    onSuccess: async ({ isReset }, { clubId: mutationClubId, user, clubProfile }) => {
      const targetClubId = mutationClubId ?? clubId;
      if (!targetClubId) return;

      queryClient.setQueryData(
        ['mypage', 'summary'],
        (
          old:
            | {
                user: {
                  name: string | null;
                  email: string | null;
                  school: string | null;
                  department: string | null;
                  studentId: string | null;
                  tel: string | null;
                };
                usingProfiles: Array<{
                  profileId: number;
                  name: string;
                  profileImageUrl: string | null;
                  headerImageUrl: string | null;
                  bio: string | null;
                  clubs: Array<{ clubId: string; name: string }>;
                }>;
              }
            | undefined,
        ) => {
          if (!old) return old;
          return {
            ...old,
            user: {
              ...old.user,
              name: user.name,
              email: user.email,
              school: user.school,
              department: user.department,
              studentId: user.studentId,
              tel: user.tel,
            },
            usingProfiles: old.usingProfiles.map((profile) =>
              profile.clubs.some((club) => club.clubId === targetClubId)
                ? {
                    ...profile,
                    ...(clubProfile && { bio: clubProfile.bio }),
                    ...(isReset && { profileImageUrl: null }),
                  }
                : profile,
            ),
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
      await queryClient.invalidateQueries({ queryKey: ['mypage', 'summary'] });
      void queryClient.invalidateQueries({ queryKey: ['home', 'recent-posts', targetClubId] });
      void queryClient.invalidateQueries({ queryKey: ['posts', targetClubId] });
    },
  });
}
