import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mypageApi } from '@/lib/apis/mypage';
import type { UpdateUserBody, UpdateClubProfileBody } from '@/lib/apis/mypage';
import { useClubId } from '@/stores/useClubStore';

interface UpdateProfileParams {
  user: UpdateUserBody;
  clubProfile: UpdateClubProfileBody;
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  const clubId = useClubId();

  return useMutation({
    mutationFn: async ({ user, clubProfile }: UpdateProfileParams) => {
      await mypageApi.updateUser(user);
      await mypageApi.updateClubProfile(clubProfile);
    },
    onSuccess: () => {
      if (clubId) {
        queryClient.invalidateQueries({ queryKey: ['mypage', 'me', clubId] });
      }
    },
  });
}
