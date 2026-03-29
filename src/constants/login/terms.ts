interface TermsItem {
  id: string;
  label: string;
  required: boolean;
  content: string;
}

const TERMS_ITEMS: TermsItem[] = [
  {
    id: 'weeth-terms',
    label: 'Weeth 이용 약관',
    required: true,
    content:
      'Weeth 서비스 이용 약관 내용이 여기에 표시됩니다. 추후 실제 약관 내용으로 교체될 예정입니다.',
  },
  {
    id: 'privacy',
    label: '개인정보 수집 및 이용 동의',
    required: true,
    content:
      '개인정보 수집 및 이용 동의 내용이 여기에 표시됩니다. 추후 실제 약관 내용으로 교체될 예정입니다.',
  },
];

const TERMS_DESCRIPTION =
  '전체 동의에는 필수 및 선택 항목에 대한 동의가 포함됩니다. 귀하는 개별적으로 동의를 선택하실 수 있습니다. 귀하가 선택 항목에 대한 동의를 거부하시는 경우에도 서비스 이용이 가능하나, 맞춤형 상품 추천을 받을 수 없습니다. 귀하가 필수 항목에 동의하지 않으실 경우 서비스 이용이 불가능할 수 있습니다.';

export { TERMS_ITEMS, TERMS_DESCRIPTION, type TermsItem };
