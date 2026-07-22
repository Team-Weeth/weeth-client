import { useMutation, useQueryClient } from '@tanstack/react-query';
import { revalidateHomeDashboard } from '@/lib/actions/home';
import { uploadFile } from '@/lib/apis/upload';
import { mypageApi } from '@/lib/apis/mypage';
import type { MyPageSummary, MyPageUsingProfile, MyPageUsingProfileClub } from '@/types/mypage';
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

const HOME_QUERY_KEY = ['home'] as const;
const MY_PROFILES_QUERY_KEY = ['mypage', 'profiles'] as const;

function getMyPageSummaryQueryKey(clubId: string) {
  return ['mypage', 'summary', clubId] as const;
}

function getMyProfileDetailQueryKey(profileId: number) {
  return ['mypage', 'profiles', profileId] as const;
}

function isCurrentClubProfile(clubId: string | null, clubs: MyPageUsingProfileClub[]) {
  return Boolean(clubId && clubs.some((club) => club.clubId === clubId));
}

function getUniqueClubIds(clubIds: Array<string | null | undefined>) {
  return [...new Set(clubIds.filter((clubId): clubId is string => Boolean(clubId)))];
}

function getProfileClubIds(profile: { clubs: MyPageUsingProfileClub[] } | undefined) {
  return getUniqueClubIds(profile?.clubs.map((club) => club.clubId) ?? []);
}

function revalidateHomeDashboards(clubIds: string[]) {
  clubIds.forEach((clubId) => {
    revalidateHomeDashboard(clubId);
  });
}

function invalidateMyPageSummaryQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  clubIds: string[],
) {
  return Promise.all(
    clubIds.map((clubId) =>
      queryClient.invalidateQueries({ queryKey: getMyPageSummaryQueryKey(clubId) }),
    ),
  );
}

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
    onSuccess: async (response, { clubIds }) => {
      const currentClubId = useClubStore.getState().clubId;
      const affectedClubIds = getUniqueClubIds([
        ...clubIds,
        ...(response.data.data.usingClubs ?? []).map((club) => club.clubId),
      ]);
      revalidateHomeDashboards(affectedClubIds);
      await Promise.all([
        invalidateMyPageSummaryQueries(queryClient, affectedClubIds),
        queryClient.invalidateQueries({ queryKey: MY_PROFILES_QUERY_KEY }),
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
    onSuccess: async (_, profileId) => {
      const currentClubId = useClubStore.getState().clubId;
      const profiles = queryClient.getQueryData<MyPageUsingProfile[]>(MY_PROFILES_QUERY_KEY) ?? [];
      const deletedProfile = profiles.find((profile) => profile.profileId === profileId);
      const affectedClubIds = getProfileClubIds(deletedProfile);

      if (deletedProfile && isCurrentClubProfile(currentClubId, deletedProfile.clubs)) {
        useUserStore.setState({ profileImageUrl: null }, false, 'deleteMultiProfile');
      }

      revalidateHomeDashboards(affectedClubIds);
      await Promise.all([
        invalidateMyPageSummaryQueries(queryClient, affectedClubIds),
        queryClient.invalidateQueries({ queryKey: MY_PROFILES_QUERY_KEY }),
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
      const currentClubId = useClubStore.getState().clubId;
      const updatedProfile = response.data.data;
      const affectedClubIds = getUniqueClubIds(
        updatedProfile.usingClubs.map((club) => club.clubId),
      );
      revalidateHomeDashboards(affectedClubIds);

      affectedClubIds.forEach((clubId) => {
        queryClient.setQueryData(
          getMyPageSummaryQueryKey(clubId),
          (old: MyPageSummary | undefined) => {
            if (!old) return old;

            const usingProfiles = old.usingProfiles.map((profile) =>
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
            );
            const currentProfile =
              old.currentProfile?.profileId === updatedProfile.profileId
                ? {
                    ...old.currentProfile,
                    name: updatedProfile.name,
                    profileImageUrl: updatedProfile.profileImageUrl,
                    headerImageUrl: updatedProfile.headerImageUrl,
                    bio: updatedProfile.bio,
                  }
                : old.currentProfile;

            return {
              ...old,
              usingProfiles,
              currentProfile,
            };
          },
        );
      });

      if (isCurrentClubProfile(currentClubId, updatedProfile.usingClubs)) {
        useUserStore.setState(
          { name: updatedProfile.name, profileImageUrl: updatedProfile.profileImageUrl },
          false,
          'syncMultiProfile',
        );
      }

      await Promise.all([
        invalidateMyPageSummaryQueries(queryClient, affectedClubIds),
        queryClient.invalidateQueries({ queryKey: MY_PROFILES_QUERY_KEY }),
        queryClient.invalidateQueries({
          queryKey: getMyProfileDetailQueryKey(updatedProfile.profileId),
        }),
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
      const currentClubId = useClubStore.getState().clubId;
      const profiles = queryClient.getQueryData<MyPageUsingProfile[]>(MY_PROFILES_QUERY_KEY) ?? [];
      const targetProfile = profiles.find((profile) => profile.profileId === profileId);
      const updatedProfileClubs = targetProfile?.clubs ?? [];
      const affectedClubIds = getProfileClubIds(targetProfile);
      revalidateHomeDashboards(affectedClubIds);

      affectedClubIds.forEach((clubId) => {
        queryClient.setQueryData(
          getMyPageSummaryQueryKey(clubId),
          (old: MyPageSummary | undefined) => {
            if (!old) return old;

            return {
              ...old,
              usingProfiles: old.usingProfiles.map((profile) =>
                profile.profileId === profileId ? { ...profile, profileImageUrl: null } : profile,
              ),
              currentProfile:
                old.currentProfile?.profileId === profileId
                  ? { ...old.currentProfile, profileImageUrl: null }
                  : old.currentProfile,
            };
          },
        );
      });

      if (isCurrentClubProfile(currentClubId, updatedProfileClubs)) {
        useUserStore.setState({ profileImageUrl: null }, false, 'deleteMultiProfileProfileImage');
      }
      await Promise.all([
        invalidateMyPageSummaryQueries(queryClient, affectedClubIds),
        queryClient.invalidateQueries({ queryKey: MY_PROFILES_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: getMyProfileDetailQueryKey(profileId) }),
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
      const profiles = queryClient.getQueryData<MyPageUsingProfile[]>(MY_PROFILES_QUERY_KEY) ?? [];
      const targetProfile = profiles.find((profile) => profile.profileId === profileId);
      const affectedClubIds = getProfileClubIds(targetProfile);
      revalidateHomeDashboards(affectedClubIds);

      affectedClubIds.forEach((clubId) => {
        queryClient.setQueryData(
          getMyPageSummaryQueryKey(clubId),
          (old: MyPageSummary | undefined) => {
            if (!old) return old;

            return {
              ...old,
              usingProfiles: old.usingProfiles.map((profile) =>
                profile.profileId === profileId ? { ...profile, headerImageUrl: null } : profile,
              ),
              currentProfile:
                old.currentProfile?.profileId === profileId
                  ? { ...old.currentProfile, headerImageUrl: null }
                  : old.currentProfile,
            };
          },
        );
      });

      await Promise.all([
        invalidateMyPageSummaryQueries(queryClient, affectedClubIds),
        queryClient.invalidateQueries({ queryKey: MY_PROFILES_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: getMyProfileDetailQueryKey(profileId) }),
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
      const currentClubId = useClubStore.getState().clubId;
      const affectedClubIds = getUniqueClubIds(assignments.map((assignment) => assignment.clubId));
      if (!currentClubId) {
        revalidateHomeDashboards(affectedClubIds);
        await Promise.all([
          invalidateMyPageSummaryQueries(queryClient, affectedClubIds),
          queryClient.invalidateQueries({ queryKey: MY_PROFILES_QUERY_KEY }),
          queryClient.invalidateQueries({ queryKey: HOME_QUERY_KEY }),
        ]);
        return;
      }
      revalidateHomeDashboards(affectedClubIds);

      const nextSummary = updateAssignedProfiles(
        queryClient.getQueryData<MyPageSummary>(getMyPageSummaryQueryKey(currentClubId)),
        assignments,
      );

      const activeAssignment = assignments.find(
        (assignment) => assignment.clubId === currentClubId,
      );
      const activeProfile = activeAssignment
        ? nextSummary?.usingProfiles.find(
            (profile) => profile.profileId === activeAssignment.profileId,
          )
        : undefined;

      if (nextSummary) {
        queryClient.setQueryData(getMyPageSummaryQueryKey(currentClubId), {
          ...nextSummary,
          currentProfile: activeProfile
            ? {
                profileId: activeProfile.profileId,
                name: activeProfile.name,
                profileImageUrl: activeProfile.profileImageUrl,
                headerImageUrl: activeProfile.headerImageUrl,
                bio: activeProfile.bio,
              }
            : (nextSummary.currentProfile ?? null),
        });
      }

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
        invalidateMyPageSummaryQueries(queryClient, affectedClubIds),
        queryClient.invalidateQueries({ queryKey: MY_PROFILES_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: getMyPageSummaryQueryKey(currentClubId) }),
        queryClient.invalidateQueries({ queryKey: HOME_QUERY_KEY }),
      ]);
    },
  });
}

export function useLeaveClubMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clubId }: LeaveClubParams) => mypageApi.leaveClub(clubId),
    onSuccess: async (_, { clubId }) => {
      revalidateHomeDashboard(clubId);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getMyPageSummaryQueryKey(clubId) }),
        queryClient.invalidateQueries({ queryKey: ['mypage', 'clubs'] }),
        queryClient.invalidateQueries({ queryKey: HOME_QUERY_KEY }),
      ]);
    },
  });
}
