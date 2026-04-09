// club 관련 타입 정의

export interface Club {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
}

/** store hydration 등에 사용되는 최소 클럽 식별 정보 */
export interface ClubIdentifier {
  clubId: string;
  clubName: string;
}
