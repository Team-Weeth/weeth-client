import { LoginCard } from '@/components/auth';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center gap-600 py-[80px]">
      <div className="typo-h3 text-text-strong text-center">
        우리 동아리만의 공간을 만들어보세요
        <br />
        Weeth에서 함께 활동을 이어가세요
      </div>
      <LoginCard />
    </div>
  );
}
