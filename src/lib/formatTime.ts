/**
 * Date 객체를 "7:00 PM" 형식의 문자열로 변환
 */
function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export { formatTime };
