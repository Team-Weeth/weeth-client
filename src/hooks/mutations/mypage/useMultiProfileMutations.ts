import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadFile } from '@/lib/apis/upload';
import { mypageApi } from '@/lib/apis/mypage';
import type { MyPageSummary, MyPageUsingProfileClub } from '@/types/mypage';
import { useClubStore } from '@/stores/useClubStore';
import { useUserStore } from '@/stores/useUserStore';

interface CreateMultiProfileParams {
  name: string;
  bio: string;
  clubIds: string[];
  profileImageFile?: File | null;
  headerImageFile?: File | null;
}

interface UpdateMultiProfileParams {
  profileId: number;
  name: string;
  bio: string;
  profileImageFile?: File | null;
  headerImageFile?: File | null;
}

interface DeleteMultiProfileImageParams {
  profileId: number;
}

interface UpdateClubProfileAssignmentsParams {
  assignments: Array<{
    clubId: string;
    profileId: number;
  }>;
}

interface LeaveClubParams {
  clubId: string;
}

const MYPAGE_SUMMARY_QUERY_KEY = ['mypage', 'summary'] as const;
const HOME_QUERY_KEY = ['home'] as const;

function updateAssignedProfiles(
  summary: MyPageSummary | undefined,
  assignments: UpdateClubProfileAssignmentsParams['assignments'],
) {
  if (!summary) return summary;

  return {
    ...summary,
    usingProfiles: summary.usingProfiles.map((profile) => {
      let nextClubs = profile.clubs;

      assignments.forEach(({ clubId, profileId }) => {
        const assignedClub =
          summary.usingProfiles
            .flatMap((item) => item.clubs)
            .find((club) => club.clubId === clubId) ??
          ({
            clubId,
            name: nextClubs.find((club) => club.clubId === clubId)?.name ?? '',
          } satisfies MyPageUsingProfileClub);

        if (profile.profileId === profileId) {
          nextClubs = nextClubs.some((club) => club.clubId === clubId)
            ? nextClubs
            : [...nextClubs, assignedClub];
          return;
        }

        nextClubs = nextClubs.filter((club) => club.clubId !== clubId);
      });

      return {
        ...profile,
        clubs: nextClubs,
      };
    }),
  };
}

export function useCreateMultiProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      bio,
      clubIds,
      profileImageFile,
      headerImageFile,
    }: CreateMultiProfileParams) => {
      const [profileImage, headerImage] = await Promise.all([
        profileImageFile ? uploadFile(profileImageFile, 'CLUB_MEMBER_PROFILE') : undefined,
        headerImageFile ? uploadFile(headerImageFile, 'CLUB_BACKGROUND') : undefined,
      ]);

      return mypageApi.createMultiProfile({
        name,
        bio,
        clubIds,
        ...(profileImage ? { profileImage } : {}),
        ...(headerImage ? { headerImage } : {}),
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: MYPAGE_SUMMARY_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ['mypage', 'clubs'] }),
        queryClient.invalidateQueries({ queryKey: HOME_QUERY_KEY }),
      ]);
    },
  });
}

export function useDeleteMultiProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileId: number) => mypageApi.deleteMultiProfile(profileId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: MYPAGE_SUMMARY_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ['mypage', 'clubs'] }),
        queryClient.invalidateQueries({ queryKey: HOME_QUERY_KEY }),
      ]);
    },
  });
}

export function useUpdateMultiProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      profileId,
      name,
      bio,
      profileImageFile,
      headerImageFile,
    }: UpdateMultiProfileParams) => {
      const [profileImage, headerImage] = await Promise.all([
        profileImageFile ? uploadFile(profileImageFile, 'CLUB_MEMBER_PROFILE') : undefined,
        headerImageFile ? uploadFile(headerImageFile, 'CLUB_BACKGROUND') : undefined,
      ]);

      return mypageApi.updateMultiProfile(profileId, {
        name,
        bio,
        ...(profileImage ? { profileImage } : {}),
        ...(headerImage ? { headerImage } : {}),
      });
    },
    onSuccess: async (response) => {
      const updatedProfile = response.data.data;

      queryClient.setQueryData(MYPAGE_SUMMARY_QUERY_KEY, (old: MyPageSummary | undefined) => {
        if (!old) return old;

        return {
          ...old,
          usingProfiles: old.usingProfiles.map((profile) =>
            profile.profileId === updatedProfile.profileId
              ? {
                  ...profile,
                  name: updatedProfile.name,
                  profileImageUrl: updatedProfile.profileImageUrl,
                  headerImageUrl: updatedProfile.headerImageUrl,
                  bio: updatedProfile.bio,
                  clubs: updatedProfile.usingClubs,
                }
              : profile,
          ),
        };
      });

      useUserStore.setState(
        { name: updatedProfile.name, profileImageUrl: updatedProfile.profileImageUrl },
        false,
        'syncMultiProfile',
      );

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: MYPAGE_SUMMARY_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: HOME_QUERY_KEY }),
      ]);
    },
  });
}

export function useDeleteMultiProfileProfileImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ profileId }: DeleteMultiProfileImageParams) =>
      mypageApi.deleteMultiProfileProfileImage(profileId),
    onSuccess: async (_, { profileId }) => {
      queryClient.setQueryData(MYPAGE_SUMMARY_QUERY_KEY, (old: MyPageSummary | undefined) => {
        if (!old) return old;

        return {
          ...old,
          usingProfiles: old.usingProfiles.map((profile) =>
            profile.profileId === profileId ? { ...profile, profileImageUrl: null } : profile,
          ),
        };
      });

      useUserStore.setState({ profileImageUrl: null }, false, 'deleteMultiProfileProfileImage');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: MYPAGE_SUMMARY_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: HOME_QUERY_KEY }),
      ]);
    },
  });
}

export function useDeleteMultiProfileHeaderImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ profileId }: DeleteMultiProfileImageParams) =>
      mypageApi.deleteMultiProfileHeaderImage(profileId),
    onSuccess: async (_, { profileId }) => {
      queryClient.setQueryData(MYPAGE_SUMMARY_QUERY_KEY, (old: MyPageSummary | undefined) => {
        if (!old) return old;

        return {
          ...old,
          usingProfiles: old.usingProfiles.map((profile) =>
            profile.profileId === profileId ? { ...profile, headerImageUrl: null } : profile,
          ),
        };
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: MYPAGE_SUMMARY_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: HOME_QUERY_KEY }),
      ]);
    },
  });
}

export function useUpdateClubProfileAssignmentsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assignments }: UpdateClubProfileAssignmentsParams) =>
      mypageApi.updateClubProfileAssignments({ assignments }),
    onSuccess: async (_, { assignments }) => {
      const nextSummary = updateAssignedProfiles(
        queryClient.getQueryData<MyPageSummary>(MYPAGE_SUMMARY_QUERY_KEY),
        assignments,
      );

      queryClient.setQueryData(MYPAGE_SUMMARY_QUERY_KEY, nextSummary);

      const currentClubId = useClubStore.getState().clubId;
      const activeAssignment =
        assignments.find((assignment) => assignment.clubId === currentClubId) ?? assignments[0];
      const activeProfile = nextSummary?.usingProfiles.find(
        (profile) => profile.profileId === activeAssignment?.profileId,
      );

      if (activeProfile) {
        useUserStore.setState(
          {
            name: activeProfile.name,
            profileImageUrl: activeProfile.profileImageUrl,
          },
          false,
          'syncClubProfileAssignment',
        );
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: MYPAGE_SUMMARY_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: HOME_QUERY_KEY }),
      ]);
    },
  });
}

export function useLeaveClubMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clubId }: LeaveClubParams) => mypageApi.leaveClub(clubId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: MYPAGE_SUMMARY_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ['mypage', 'clubs'] }),
        queryClient.invalidateQueries({ queryKey: HOME_QUERY_KEY }),
      ]);
    },
  });
}
