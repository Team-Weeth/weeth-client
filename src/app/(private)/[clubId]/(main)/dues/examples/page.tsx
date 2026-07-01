import { DuesLeftSection } from '@/components/dues';
import type { DuesSummary } from '@/types/dues';

const BASE_DUES: Omit<DuesSummary, 'isPaid' | 'isAccountPublic'> = {
  cardinalNumber: 7,
  duesAmount: 60000,
  currentBalance: 152129,
  targetBalance: 1425000,
  account: {
    bankName: '국민은행',
    accountNumber: '12-12412-1231',
    holderName: '가천대 검도부',
  },
};

const EXAMPLES: Array<{
  title: string;
  description: string;
  dues: DuesSummary;
}> = [
  {
    title: '회비 납부 X · 계좌 공개 O',
    description: '미납 안내, 계좌 정보, 계좌 복사하고 납부하기 버튼이 보여요.',
    dues: {
      ...BASE_DUES,
      isPaid: false,
      isAccountPublic: true,
    },
  },
  {
    title: '회비 납부 X · 계좌 공개 X',
    description: '미납 안내와 운영진 문의 문구만 보여요.',
    dues: {
      ...BASE_DUES,
      isPaid: false,
      isAccountPublic: false,
    },
  },
  {
    title: '회비 납부 O · 계좌 공개 O',
    description: '납부 완료 상태와 계좌 정보가 보이고 복사 버튼은 없어요.',
    dues: {
      ...BASE_DUES,
      isPaid: true,
      isAccountPublic: true,
    },
  },
  {
    title: '회비 납부 O · 계좌 공개 X',
    description: '납부 완료 상태와 운영진 문의 문구가 보여요.',
    dues: {
      ...BASE_DUES,
      isPaid: true,
      isAccountPublic: false,
    },
  },
];

export default function DuesExamplesPage() {
  return (
    <main className="mx-auto flex w-full max-w-[1180px] flex-col gap-700 px-450 pt-600 pb-800">
      <div className="flex flex-col gap-200">
        <p className="typo-caption1 text-text-alternative">회비 UI 예제</p>
        <h1 className="typo-h1 text-text-strong">회비 상태별 왼쪽 섹션</h1>
        <p className="typo-body1 text-text-alternative">
          회비 납부 여부와 계좌 공개 여부에 따른 4가지 UI를 한 번에 확인할 수 있어요.
        </p>
      </div>

      <div className="desktop:grid-cols-2 grid grid-cols-1 gap-500">
        {EXAMPLES.map(({ title, description, dues }) => (
          <section
            key={title}
            className="border-line flex flex-col gap-300 rounded-lg border p-400"
          >
            <div className="flex flex-col gap-100">
              <h2 className="typo-sub1 text-text-strong">{title}</h2>
              <p className="typo-body2 text-text-alternative">{description}</p>
            </div>
            <DuesLeftSection dues={dues} />
          </section>
        ))}
      </div>
    </main>
  );
}
