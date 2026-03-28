import { z } from 'zod';

export const createClubSchema = z
  .object({
    school: z.string().min(1, '소속 학교를 선택해주세요'),
    name: z.string().min(1, '동아리 이름을 입력해주세요'),
    description: z.string().max(30, '30자 이내로 입력해주세요'),
    generation: z.string().min(1, '기수를 입력해주세요'),
    phone: z
      .string()
      .min(1, '대표 전화번호를 입력해주세요')
      .regex(/^\d{3}-\d{3,4}-\d{4}$/, '올바른 전화번호 형식이 아닙니다'),
    email: z.union([z.email('올바른 이메일 형식이 아닙니다'), z.literal('')]),
    contactType: z.enum(['phone', 'email']),
    termsAgreed: z.literal(true, '약관에 동의해주세요'),
  })
  .superRefine((data, ctx) => {
    if (data.contactType === 'email' && !data.email) {
      ctx.addIssue({
        code: 'custom',
        message: '주 연락처가 이메일인 경우 이메일을 입력해주세요',
        path: ['email'],
      });
    }
  });

export type CreateClubFormData = z.infer<typeof createClubSchema>;
