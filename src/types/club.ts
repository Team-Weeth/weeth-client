export interface Club {
  id: string;
  name: string;
  code: string;
  schoolName: string;
  description: string;
  contactEmail: string;
  contactPhoneNumber: string;
  primaryContact: 'PHONE' | 'EMAIL';
  profileImageUrl: string;
  backgroundImageUrl: string;
}

/** store hydration 등에 사용되는 최소 클럽 식별 정보 */
export interface ClubIdentifier {
  clubId: string;
  clubName: string;
}
