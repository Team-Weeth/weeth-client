import { z } from 'zod';

export const inviteCodeSchema = z.object({
  inviteCode: z.string().min(1, '초대 링크를 입력해주세요'),
});

export type InviteCodeFormData = z.infer<typeof inviteCodeSchema>;
