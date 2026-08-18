import { duesBankAccountSchema, duesBasicSchema } from '@/lib/schemas/duesSetup';

describe('duesBasicSchema (Step 1 기본 정보)', () => {
  const validInput = {
    amount: '50000',
    name: '2025년 1학기 회비',
    description: '정기 회비',
  };

  it('유효한 입력을 통과시킨다', () => {
    expect(duesBasicSchema.safeParse(validInput).success).toBe(true);
  });

  it('amount가 비어 있으면 실패한다', () => {
    const result = duesBasicSchema.safeParse({ ...validInput, amount: '' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('회비 금액을 입력해주세요');
    }
  });

  it('amount가 0 이하면 실패한다', () => {
    expect(duesBasicSchema.safeParse({ ...validInput, amount: '0' }).success).toBe(false);
  });

  it('name이 공백뿐이면 실패한다', () => {
    expect(duesBasicSchema.safeParse({ ...validInput, name: '   ' }).success).toBe(false);
  });

  it('name이 30자를 초과하면 실패한다', () => {
    expect(duesBasicSchema.safeParse({ ...validInput, name: 'a'.repeat(31) }).success).toBe(false);
  });
});

describe('duesBankAccountSchema (Step 4 계좌 공개)', () => {
  const validInput = {
    accountNumber: '110-123-456789',
    bankName: '신한은행',
    accountHolder: '홍길동',
    accountGuide: '입금 시 이름 기재',
    isAccountPublic: true,
  };

  it('유효한 입력을 통과시킨다', () => {
    expect(duesBankAccountSchema.safeParse(validInput).success).toBe(true);
  });

  it('accountNumber가 비어 있으면 실패한다', () => {
    const result = duesBankAccountSchema.safeParse({ ...validInput, accountNumber: '' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('계좌번호를 입력해주세요');
    }
  });

  it('bankName이 비어 있으면 실패한다', () => {
    expect(duesBankAccountSchema.safeParse({ ...validInput, bankName: '' }).success).toBe(false);
  });

  it('isAccountPublic이 boolean이 아니면 실패한다', () => {
    const result = duesBankAccountSchema.safeParse({
      ...validInput,
      isAccountPublic: 'true',
    });
    expect(result.success).toBe(false);
  });
});
