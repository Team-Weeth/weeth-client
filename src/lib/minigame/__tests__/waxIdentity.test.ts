import {
  savedWaxNickname,
  saveWaxNickname,
  waxDeviceToken,
  waxNicknameError,
} from '@/lib/minigame/waxIdentity';

describe('waxIdentity', () => {
  beforeEach(() => window.localStorage.clear());

  it('기기 토큰은 서버 형식에 맞고, 저장해 두고 다음에도 같은 값을 쓴다', () => {
    const token = waxDeviceToken();
    expect(token).toMatch(/^[A-Za-z0-9-]{16,64}$/);
    expect(window.localStorage.getItem('wax:device-token')).toBe(token);
    expect(waxDeviceToken()).toBe(token);
  });

  it('저장된 토큰이 형식에 맞지 않으면 새로 만든다', () => {
    window.localStorage.setItem('wax:device-token', 'bad');
    expect(waxDeviceToken()).toMatch(/^[A-Za-z0-9-]{16,64}$/);
  });

  it('직접 입력 닉네임은 2~8자의 한글·영문·숫자만 받는다', () => {
    ['새내기', 'ab', 'Player01', '왁뿌볼고수12'].forEach((name) =>
      expect(waxNicknameError(name)).toBeNull(),
    );
    ['가', '아홉글자닉네임이다', '공백 포함', '특수!', 'ㄱㄴ'].forEach((name) =>
      expect(waxNicknameError(name)).not.toBeNull(),
    );
  });

  it('마지막으로 직접 입력한 닉네임을 저장하고 읽는다', () => {
    expect(savedWaxNickname()).toBeNull();
    saveWaxNickname('왁뿌볼고수');
    expect(savedWaxNickname()).toBe('왁뿌볼고수');
  });
});
