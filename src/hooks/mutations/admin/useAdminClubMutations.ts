import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminClubApi } from '@/lib/apis/adminClub';
import type { UpdateClubBody } from '@/lib/apis/adminClub';
import { revalidatePublicClub } from '@/lib/actions/club';
import { useClubId } from '@/stores';
import { adminQueryKeys } from '@/hooks/queries/admin/adminQueryKeys';

export function useUpdateClub() {
  const queryClient = useQueryClient();
  const clubId = useClubId();

  return useMutation({
    mutationFn: (body: UpdateClubBody) => {
      if (!clubId) throw new Error('clubId가 없습니다');
      return adminClubApi.update(clubId, body);
    },
    onSuccess: () => {
      if (clubId) revalidatePublicClub(clubId);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.club(clubId) });
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
