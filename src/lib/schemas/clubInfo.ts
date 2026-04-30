import { z } from 'zod';

export const clubInfoSchema = z.object({
  school: z.string().min(1, '학교를 선택해주세요'),
  name: z.string().min(1, '동아리 이름을 입력해주세요'),
  description: z.string().max(30, '30자 이내로 입력해주세요'),
  phone: z
    .string()
    .min(1, '전화번호를 입력해주세요')
    .regex(/^\d{2,3}-\d{3,4}-\d{4}$/, '010-0000-0000 형식으로 입력해주세요'),
  email: z.union([z.literal(''), z.email('올바른 이메일 형식으로 입력해주세요')]),
  primaryContact: z.enum(['phone', 'email']),
});

export type ClubInfoFormData = z.infer<typeof clubInfoSchema>;
