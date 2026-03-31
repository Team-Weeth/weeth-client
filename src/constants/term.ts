const POLICY_EMAIL = 'help@weeth.kr';

interface BaseSection {
  heading: string;
}

interface ListSection extends BaseSection {
  type: 'list';
  items: string[];
}

interface IntroListSection extends BaseSection {
  type: 'intro-list';
  intro: string;
  listHeading: string;
  items: string[];
  footer: string;
}

interface ContactSection extends BaseSection {
  type: 'contact';
  prefix: string;
  email: string;
  suffix: string;
}

type PolicySectionData = ListSection | IntroListSection | ContactSection;

interface PolicyData {
  title: string;
  intro: string[];
  sections: PolicySectionData[];
}

const TERMS_DATA: PolicyData = {
  title: '이용약관',
  intro: [
    'Weeth(이하 "서비스")는 개인 운영팀이 운영하는 동아리 관리 플랫폼입니다.',
    '본 약관은 서비스 이용과 관련된 기본적인 원칙을 안내합니다.',
  ],
  sections: [
    {
      type: 'intro-list',
      heading: '1. 서비스 소개',
      intro: 'Weeth는 동아리 운영을 돕기 위한 플랫폼입니다.',
      listHeading: '제공 기능:',
      items: [
        '동아리 생성 및 관리',
        '일정 및 세션 관리',
        '출석 관리',
        '게시판 및 커뮤니티 기능',
        '파일 업로드 기능',
      ],
      footer:
        '서비스는 현재 비상업적으로 운영되고 있으며, 향후 기능이 변경되거나 종료될 수 있습니다.',
    },
    {
      type: 'list',
      heading: '2. 회원가입과 계정',
      items: [
        '누구나 가입할 수 있습니다.',
        '정확한 정보를 입력해야 합니다.',
        '계정 관리 책임은 본인에게 있습니다.',
        '타인의 정보를 도용하면 이용이 제한될 수 있습니다.',
      ],
    },
    {
      type: 'list',
      heading: '3. 이용 규칙',
      items: [
        '타인의 권리를 침해하는 콘텐츠를 게시하지 마세요.',
        '서비스를 악용하거나 비정상적인 방법으로 사용하지 마세요.',
        '운영팀의 정당한 요청에 따라야 합니다.',
        '규칙 위반 시 서비스 이용이 제한될 수 있습니다.',
      ],
    },
    {
      type: 'list',
      heading: '4. 책임 제한',
      items: [
        '서비스는 "있는 그대로" 제공됩니다.',
        '운영팀은 서비스 중단이나 데이터 손실에 대해 책임지지 않습니다.',
        '서비스 이용으로 발생한 분쟁은 이용자가 책임집니다.',
      ],
    },
    {
      type: 'list',
      heading: '5. 서비스 변경 및 종료',
      items: [
        '운영팀은 서비스를 언제든지 변경하거나 종료할 수 있습니다.',
        '중요한 변경 사항은 사전에 공지합니다.',
        '서비스 종료 시 데이터를 미리 백업하시기 바랍니다.',
      ],
    },
    {
      type: 'contact',
      heading: '6. 문의',
      prefix: '서비스 이용에 관한 문의는 ',
      email: POLICY_EMAIL,
      suffix: '로 연락해 주세요.',
    },
  ],
};

const PRIVACY_DATA: PolicyData = {
  title: '개인정보 처리방침',
  intro: [
    'Weeth(이하 "서비스")는 이용자의 개인정보를 소중히 여기며, 관련 법령에 따라 개인정보를 처리합니다.',
    '본 방침은 서비스 이용 중 수집되는 개인정보의 처리 방식을 안내합니다.',
  ],
  sections: [
    {
      type: 'list',
      heading: '1. 수집하는 개인정보',
      items: [
        '이름, 이메일 주소, 연락처',
        '학교, 학과, 학번 등 학적 정보',
        '소셜 로그인 제공자로부터 제공받은 기본 정보',
        '서비스 이용 기록, 출석 기록',
      ],
    },
    {
      type: 'list',
      heading: '2. 개인정보 수집 목적',
      items: [
        '회원 식별 및 서비스 제공',
        '동아리 출석 관리 및 활동 기록',
        '서비스 운영 및 개선',
        '공지사항 전달',
      ],
    },
    {
      type: 'list',
      heading: '3. 개인정보 보유 및 이용 기간',
      items: [
        '회원 탈퇴 시 즉시 파기합니다.',
        '관련 법령에 따라 일정 기간 보존이 필요한 정보는 해당 기간 동안 보관합니다.',
        '동아리 활동 기록은 탈퇴 후 30일 이내 삭제됩니다.',
      ],
    },
    {
      type: 'list',
      heading: '4. 개인정보 제3자 제공',
      items: [
        '원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.',
        '다만, 법령에 의한 요청이 있거나 이용자의 동의가 있는 경우에는 예외적으로 제공할 수 있습니다.',
      ],
    },
    {
      type: 'list',
      heading: '5. 이용자의 권리',
      items: [
        '개인정보 열람, 수정, 삭제를 요청할 수 있습니다.',
        '개인정보 처리에 대한 동의를 철회할 수 있습니다.',
        '동의 철회 시 일부 서비스 이용이 제한될 수 있습니다.',
      ],
    },
    {
      type: 'contact',
      heading: '6. 개인정보 보호 책임자',
      prefix: '개인정보 관련 문의는 ',
      email: POLICY_EMAIL,
      suffix: '로 연락해 주세요.',
    },
  ],
};

export { TERMS_DATA, PRIVACY_DATA };
export type { PolicyData, PolicySectionData, ListSection, IntroListSection, ContactSection };
