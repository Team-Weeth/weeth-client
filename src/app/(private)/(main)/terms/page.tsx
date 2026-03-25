import { PolicyContent, PolicySection } from '@/components/policy';

export default function TermsPage() {
  return (
    <PolicyContent title="이용약관">
      {/* 소개 */}
      <div className="typo-body2 text-text-alternative flex flex-col gap-200">
        <p>Weeth(이하 &quot;서비스&quot;)는 개인 운영팀이 운영하는 동아리 관리 플랫폼입니다.</p>
        <p>본 약관은 서비스 이용과 관련된 기본적인 원칙을 안내합니다.</p>
      </div>

      <PolicySection heading="1. 서비스 소개">
        <p>Weeth는 동아리 운영을 돕기 위한 플랫폼입니다.</p>
        <div>
          <p>제공 기능:</p>
          <ul className="mt-200 list-disc pl-500">
            <li>동아리 생성 및 관리</li>
            <li>일정 및 세션 관리</li>
            <li>출석 관리</li>
            <li>게시판 및 커뮤니티 기능</li>
            <li>파일 업로드 기능</li>
          </ul>
        </div>
        <p>
          서비스는 현재 비상업적으로 운영되고 있으며, 향후 기능이 변경되거나 종료될 수 있습니다.
        </p>
      </PolicySection>

      <PolicySection heading="2. 회원가입과 계정">
        <ul className="list-disc pl-500">
          <li>누구나 가입할 수 있습니다.</li>
          <li>정확한 정보를 입력해야 합니다.</li>
          <li>계정 관리 책임은 본인에게 있습니다.</li>
          <li>타인의 정보를 도용하면 이용이 제한될 수 있습니다.</li>
        </ul>
      </PolicySection>

      <PolicySection heading="3. 이용 규칙">
        <ul className="list-disc pl-500">
          <li>타인의 권리를 침해하는 콘텐츠를 게시하지 마세요.</li>
          <li>서비스를 악용하거나 비정상적인 방법으로 사용하지 마세요.</li>
          <li>운영팀의 정당한 요청에 따라야 합니다.</li>
          <li>규칙 위반 시 서비스 이용이 제한될 수 있습니다.</li>
        </ul>
      </PolicySection>

      <PolicySection heading="4. 책임 제한">
        <ul className="list-disc pl-500">
          <li>서비스는 &quot;있는 그대로&quot; 제공됩니다.</li>
          <li>운영팀은 서비스 중단이나 데이터 손실에 대해 책임지지 않습니다.</li>
          <li>서비스 이용으로 발생한 분쟁은 이용자가 책임집니다.</li>
        </ul>
      </PolicySection>

      <PolicySection heading="5. 서비스 변경 및 종료">
        <ul className="list-disc pl-500">
          <li>운영팀은 서비스를 언제든지 변경하거나 종료할 수 있습니다.</li>
          <li>중요한 변경 사항은 사전에 공지합니다.</li>
          <li>서비스 종료 시 데이터를 미리 백업하시기 바랍니다.</li>
        </ul>
      </PolicySection>

      <PolicySection heading="6. 문의">
        <p>
          서비스 이용에 관한 문의는 <span className="text-brand-primary">help@weeth.kr</span>로
          연락해 주세요.
        </p>
      </PolicySection>
    </PolicyContent>
  );
}
