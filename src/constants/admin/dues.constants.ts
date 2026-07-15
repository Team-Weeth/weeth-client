/** 회비 관련 서버 응답 코드 */

/** 등록이 완료되지 않은 장부에 대시보드를 조회했을 때 반환되는 코드 (온보딩 필요) */
export const DUES_NOT_REGISTERED_CODE = 20112;
export const DUES_NOT_EXIST_CODE = 20100;

/**
 * 잔액 부족으로 환불이 거부됐을 때 서버 응답 메시지에 포함되는 문구.
 * 잔액 부족은 전용 에러 코드 없이 500 + "잔액이 부족합니다. 현재: n, 요청: n" 메시지로만
 * 내려오므로 부득이하게 메시지 부분 일치로 판별한다. (백엔드 에러 코드 추가되면 코드 기반으로 교체)
 */
export const DUES_INSUFFICIENT_BALANCE_MESSAGE = '잔액이 부족';
