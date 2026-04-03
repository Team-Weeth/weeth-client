import {
  PRIVACY_DATA,
  TERMS_DATA,
  type PolicyData,
} from '@/constants/term';

interface TermsItem {
  id: string;
  label: string;
  required: boolean;
  policy: PolicyData;
}

const TERMS_ITEMS: TermsItem[] = [
  {
    id: 'weeth-terms',
    label: 'Weeth 이용 약관',
    required: true,
    policy: TERMS_DATA,
  },
  {
    id: 'privacy',
    label: '개인정보 수집 및 이용 동의',
    required: true,
    policy: PRIVACY_DATA,
  },
];

const TERMS_DESCRIPTION =
  '전체 동의에는 필수 및 선택 항목에 대한 동의가 포함됩니다. 귀하는 개별적으로 동의를 선택하실 수 있습니다. 귀하가 선택 항목에 대한 동의를 거부하시는 경우에도 서비스 이용이 가능하나, 맞춤형 상품 추천을 받을 수 없습니다. 귀하가 필수 항목에 동의하지 않으실 경우 서비스 이용이 불가능할 수 있습니다.';

export { TERMS_ITEMS, TERMS_DESCRIPTION, type TermsItem };
