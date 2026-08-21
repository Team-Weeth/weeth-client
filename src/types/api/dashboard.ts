import type { components } from '@/types/api';

type S<K extends keyof components['schemas']> = components['schemas'][K];

/** 홈 대시보드 전체 */
export type DashboardHome =
  S<'com.weeth.domain.dashboard.application.dto.response.DashboardHomeResponse'>;

/** 동아리 기본 정보 (대시보드용) */
export type DashboardClubInfo =
  S<'com.weeth.domain.dashboard.application.dto.response.DashboardClubInfoResponse'>;

/** 내 활동 정보 (대시보드용) */
export type DashboardMyInfo =
  S<'com.weeth.domain.dashboard.application.dto.response.DashboardMyInfoResponse'>;

/** 읽지 않은 공지 */
export type DashboardUnreadNotice =
  S<'com.weeth.domain.dashboard.application.dto.response.DashboardUnreadNoticeResponse'>;

/** 최신 게시글 아이템 (대시보드용) */
export type DashboardPost =
  S<'com.weeth.domain.dashboard.application.dto.response.DashboardPostResponse'>;

/** 최신 공지 아이템 */
export type DashboardNotice =
  S<'com.weeth.domain.dashboard.application.dto.response.DashboardNoticeResponse'>;

/** 월간 일정 아이템 */
export type DashboardSchedule =
  S<'com.weeth.domain.dashboard.application.dto.response.DashboardScheduleResponse'>;
