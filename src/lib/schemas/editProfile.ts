import { z } from 'zod';

export const createEditProfileSchema = () =>
  z.object({
    name: z.string().min(1, '이름을 입력해주세요'),
    bio: z.string().max(30, '30자 이내로 입력해주세요'),
    phone: z
      .string()
      .min(1, '연락처를 입력해주세요')
      .regex(/^\d{2,3}-\d{3,4}-\d{4}$/, '올바른 전화번호 형식이 아닙니다'),
    email: z
      .string()
      .min(1, '이메일을 입력해주세요')
      .refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), '올바른 이메일 형식이 아닙니다'),
    school: z.string().min(1, '학교를 선택해주세요'),
    department: z.string().min(1, '학과를 선택해주세요'),
    studentId: z.string().min(6, '학번 전체를 입력해주세요').max(20, '학번은 20자 이내로 입력해주세요'),
  });

export const editProfileSchema = createEditProfileSchema();

export type EditProfileFormData = z.infer<typeof editProfileSchema>;
