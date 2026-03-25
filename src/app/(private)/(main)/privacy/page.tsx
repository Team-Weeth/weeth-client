import { PolicyContent, PolicySection } from '@/components/policy';

export default function PrivacyPage() {
  return (
    <PolicyContent title="개인정보 처리방침">
      {/* 소개 */}
      <div className="typo-body2 text-text-alternative flex flex-col gap-200">
        <p>
          Weeth(이하 &quot;서비스&quot;)는 이용자의 개인정보를 소중히 여기며, 관련 법령에 따라
          개인정보를 처리합니다.
        </p>
        <p>본 방침은 서비스 이용 중 수집되는 개인정보의 처리 방식을 안내합니다.</p>
      </div>

      <PolicySection heading="1. 수집하는 개인정보">
        <ul className="list-disc pl-500">
          <li>이름, 이메일 주소, 연락처</li>
          <li>학교, 학과, 학번 등 학적 정보</li>
          <li>소셜 로그인 제공자로부터 제공받은 기본 정보</li>
          <li>서비스 이용 기록, 출석 기록</li>
        </ul>
      </PolicySection>

      <PolicySection heading="2. 개인정보 수집 목적">
        <ul className="list-disc pl-500">
          <li>회원 식별 및 서비스 제공</li>
          <li>동아리 출석 관리 및 활동 기록</li>
          <li>서비스 운영 및 개선</li>
          <li>공지사항 전달</li>
        </ul>
      </PolicySection>

      <PolicySection heading="3. 개인정보 보유 및 이용 기간">
        <ul className="list-disc pl-500">
          <li>회원 탈퇴 시 즉시 파기합니다.</li>
          <li>관련 법령에 따라 일정 기간 보존이 필요한 정보는 해당 기간 동안 보관합니다.</li>
          <li>동아리 활동 기록은 탈퇴 후 30일 이내 삭제됩니다.</li>
        </ul>
      </PolicySection>

      <PolicySection heading="4. 개인정보 제3자 제공">
        <ul className="list-disc pl-500">
          <li>원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.</li>
          <li>
            다만, 법령에 의한 요청이 있거나 이용자의 동의가 있는 경우에는 예외적으로 제공할 수
            있습니다.
          </li>
        </ul>
      </PolicySection>

      <PolicySection heading="5. 이용자의 권리">
        <ul className="list-disc pl-500">
          <li>개인정보 열람, 수정, 삭제를 요청할 수 있습니다.</li>
          <li>개인정보 처리에 대한 동의를 철회할 수 있습니다.</li>
          <li>동의 철회 시 일부 서비스 이용이 제한될 수 있습니다.</li>
        </ul>
      </PolicySection>

      <PolicySection heading="6. 개인정보 보호 책임자">
        <p>
          개인정보 관련 문의는 <span className="text-brand-primary">help@weeth.kr</span>로 연락해
          주세요.
        </p>
      </PolicySection>
    </PolicyContent>
  );
}
