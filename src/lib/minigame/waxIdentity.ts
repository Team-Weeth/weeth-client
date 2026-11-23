/**
 * 로그인 없는 왁뿌볼에서 같은 기기를 같은 사람으로 보기 위한 기기 토큰과 마지막 닉네임.
 * 시크릿 모드처럼 저장소를 못 쓰면 이번 방문 동안만 메모리에 둔다(랭킹은 새 사람으로 쌓인다).
 */
const TOKEN_KEY = 'wax:device-token';
const NICKNAME_KEY = 'wax:nickname';
/** 서버 `WaxPlayerToken` 형식과 같다. */
const TOKEN_PATTERN = /^[A-Za-z0-9-]{16,64}$/;
/** 서버 `WaxNickname` 직접 입력 규칙과 같다(2~8자 한글 완성형·영문·숫자). */
export const WAX_NICKNAME_PATTERN = /^[가-힣a-zA-Z0-9]{2,8}$/;

let memoryToken: string | null = null;

function read(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* 저장소를 못 쓰면 이번 방문 동안만 쓴다. */
  }
}

function randomToken() {
  // randomUUID는 보안 컨텍스트(https·localhost)에서만 있다. 사내망 IP로 띄운 dev 화면에서도 동작하게 대체한다.
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function waxDeviceToken() {
  const stored = read(TOKEN_KEY);
  if (stored && TOKEN_PATTERN.test(stored)) return stored;
  memoryToken ??= randomToken();
  write(TOKEN_KEY, memoryToken);
  return memoryToken;
}

export function savedWaxNickname() {
  return read(NICKNAME_KEY);
}

export function saveWaxNickname(name: string) {
  write(NICKNAME_KEY, name);
}

/** 직접 입력한 닉네임이 규칙에 맞지 않으면 안내 문구를, 맞으면 null을 돌려준다. */
export function waxNicknameError(name: string) {
  return WAX_NICKNAME_PATTERN.test(name) ? null : '2~8자의 한글·영문·숫자로 정해주세요.';
}
