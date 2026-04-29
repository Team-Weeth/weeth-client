export const ATTENDANCE_ERROR_CODE = {
  NOT_FOUND: 20200,
  CODE_MISMATCH: 20201,
  QR_EXPIRED: 20203,
  ALREADY_ATTENDED: 20204,
} as const;

export const ATTENDANCE_ERROR_MESSAGE: Record<number, string> = {
  [ATTENDANCE_ERROR_CODE.NOT_FOUND]: '출석 정보가 존재하지 않습니다.',
  [ATTENDANCE_ERROR_CODE.CODE_MISMATCH]: '출석 코드가 일치하지 않습니다.',
  [ATTENDANCE_ERROR_CODE.QR_EXPIRED]: 'QR 코드가 만료되었거나 존재하지 않습니다.',
  [ATTENDANCE_ERROR_CODE.ALREADY_ATTENDED]: '이미 출석 처리된 세션입니다.',
};
