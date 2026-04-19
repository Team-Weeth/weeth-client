import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminClubApi } from '@/lib/apis/adminClub';
import type { UpdateClubBody } from '@/lib/apis/adminClub';
import { useClubId } from '@/stores';

export function useUpdateClub() {
  const queryClient = useQueryClient();
  const clubId = useClubId();

  return useMutation({
    mutationFn: (body: UpdateClubBody) => {
      if (!clubId) throw new Error('clubId가 없습니다');
      return adminClubApi.update(clubId, body);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'club', clubId] });
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
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'club', clubId] });
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
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'club', clubId] });
    },
  });
}
