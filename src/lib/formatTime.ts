/**
 * Date 객체를 "7:00 PM" 형식의 문자열로 변환
 */
function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

/**
 * "2026년 3월 20일" 형식의 날짜 문자열로 변환
 */
function formatKoreanDate(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

/**
 * 출석 카드용 설명 문자열 생성
 * "날짜 : 2026년 3월 20일 (7:00 PM~9:00 PM)\n장소 : 동아리방"
 */
function formatAttendanceDescription(start: string, end: string, location: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  return `날짜 : ${formatKoreanDate(startDate)} (${formatTime(startDate)}~${formatTime(endDate)})\n장소 : ${location}`;
}

/**
 * 출석 모달용 설명 문자열 생성
 * "2026년 3월 20일 · 동아리방"
 */
function formatModalDescription(start: string, location: string) {
  const date = new Date(start);
  return `${formatKoreanDate(date)} · ${location}`;
}

/**
 * ISO 문자열을 "MM/DD HH:mm" 형식으로 변환
 */
function formatShortDateTime(time: string) {
  const date = new Date(time);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${hours}:${minutes}`;
}

export { formatTime, formatKoreanDate, formatAttendanceDescription, formatModalDescription, formatShortDateTime };
