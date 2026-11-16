/** 2026년 11월 왁뿌볼 이벤트 진입점(상단 띠배너·GNB 이벤트 탭·홈 팝업)에서 쓰는 값 */

/** 동아리가 없는 화면(랜딩)에서 가는 공개 게임 페이지. 게임이 처음부터 화면 전체로 뜬다. */
export const WAX_GAME_PATH = '/play/wax';

/** 동아리 화면에서 가는 이벤트 페이지. GNB 아래에 진입 화면을 띄우고, 입장하면 화면 전체로 게임을 한다. */
export const getWaxEventPath = (clubId: string) => `/${clubId}/event`;

/**
 * 이벤트마다 키를 바꿔서, 이번 배너를 닫은 사람에게도 다음 이벤트 배너는 다시 보이게 한다.
 * 배너는 닫으면 다시 보이지 않고, 팝업은 저장한 만료 시각까지 보이지 않는다.
 */
export const WAX_EVENT_STORAGE_KEYS = {
  bannerClosed: 'topBanner_closed_wakppu_202611',
  popupHideUntil: 'popup_hide_until_wakppu_202611',
} as const;

export const WAX_EVENT_POPUP_HIDE_HOURS = 24;

/** 상단 띠배너 높이(px). 헤더 아래에 붙는 요소가 배너만큼 내려갈 때 쓴다. */
export const WAX_EVENT_BANNER_HEIGHT = 52;

export const WAX_EVENT_COPY = {
  bannerTitle: '교수님 몰래 왁뿌하기',
  bannerDescription: '위드에서 진행하는 이벤트! 우리 동아리에서 왁뿌 탑은 누가 될 것인지',
  popupTitle: '교수님 모르게 왁뿌를 성공하자!',
  popupDescription: '우리 동아리에서 왁뿌 탑은 누가 될 것인지!',
  popupCta: '게임 시작하기',
  navLabel: '이벤트',
} as const;
