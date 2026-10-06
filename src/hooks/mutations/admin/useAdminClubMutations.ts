import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminClubApi } from '@/lib/apis/adminClub';
import type { UpdateClubBody } from '@/lib/apis/adminClub';
import { revalidatePublicClub } from '@/lib/actions/club';
import { useClubActions, useClubId } from '@/stores';
import { useClubStore } from '@/stores/useClubStore';
import { adminQueryKeys } from '@/hooks/queries/admin/adminQueryKeys';

export function useUpdateClub() {
  const queryClient = useQueryClient();
  const clubId = useClubId();
  const { setClubName } = useClubActions();

  return useMutation({
    mutationFn: (body: UpdateClubBody) => {
      if (!clubId) throw new Error('clubId가 없습니다');
      return adminClubApi.update(clubId, body);
    },
    onMutate: () => ({ savedClubId: clubId }),
    onSuccess: (_, variables, context) => {
      const savedClubId = context?.savedClubId;
      if (savedClubId) revalidatePublicClub(savedClubId);
      if (variables.name !== undefined && useClubStore.getState().clubId === savedClubId) {
        setClubName(variables.name);
      }
    },
    onSettled: (_, __, ___, context) => {
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.club(context?.savedClubId ?? clubId),
      });
    },
  });
}

export function useDeleteClubProfileImage() {
  const queryClient = useQueryClient();
  const clubId = useClubId();

  return useMutation({
    mutationFn: () => {
      if (!clubId) throw new Error('clubId가 없습니다');
      return adminClubApi.deleteProfileImage(clubId);
    },
    onSuccess: () => {
      if (clubId) revalidatePublicClub(clubId);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.club(clubId) });
    },
  });
}

export function useDeleteClubBackgroundImage() {
  const queryClient = useQueryClient();
  const clubId = useClubId();

  return useMutation({
    mutationFn: () => {
      if (!clubId) throw new Error('clubId가 없습니다');
      return adminClubApi.deleteBackgroundImage(clubId);
    },
    onSuccess: () => {
      if (clubId) revalidatePublicClub(clubId);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.club(clubId) });
    },
  });
}
