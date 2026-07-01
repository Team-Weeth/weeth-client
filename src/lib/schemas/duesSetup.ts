import { z } from 'zod';

// Step 1: 기본 정보
export const duesBasicSchema = z.object({
  amount: z
    .string()
    .min(1, '회비 금액을 입력해주세요')
    .refine((value) => Number(value) > 0, '회비 금액을 입력해주세요'),
  name: z.string().trim().min(1, '회비 이름을 입력해주세요').max(30),
  description: z.string().max(30),
});
export type DuesBasicFormData = z.infer<typeof duesBasicSchema>;

// Step 4: 계좌 공개
export const duesBankAccountSchema = z.object({
  accountNumber: z.string().trim().min(1, '계좌번호를 입력해주세요').max(20),
  bankName: z.string().trim().min(1, '은행을 입력해주세요'),
  accountHolder: z.string().trim().min(1, '예금주를 입력해주세요').max(30),
  accountGuide: z.string().max(30),
  isAccountPublic: z.boolean(),
});
export type DuesBankAccountFormData = z.infer<typeof duesBankAccountSchema>;
