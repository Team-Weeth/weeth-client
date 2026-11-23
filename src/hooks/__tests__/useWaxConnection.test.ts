import { act, renderHook } from '@testing-library/react';
import { useWaxConnection } from '@/hooks/useWaxConnection';
import type { WaxState, WaxWelcome } from '@/types/wax';

class FakeSocket {
  static OPEN = 1;
  static instances: FakeSocket[] = [];
  readyState = 0;
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  send = jest.fn();
  close = jest.fn(() => {
    this.readyState = 3;
    this.onclose?.();
  });

  constructor() {
    FakeSocket.instances.push(this);
  }
  open() {
    this.readyState = 1;
    this.onopen?.();
  }
  receive(message: WaxState | WaxWelcome | Record<string, unknown>) {
    this.onmessage?.({ data: JSON.stringify(message) });
  }
  /** 서버가 보낸 첫 join 명령. */
  joined() {
    return this.send.mock.calls
      .map(([raw]) => JSON.parse(raw))
      .find((message) => message.type === 'join');
  }
}

function seatedState(now = 10000): WaxState {
  return {
    type: 'state',
    now,
    players: [],
    professors: [],
    you: {
      id: 'me',
      room: 1,
      seat: 0,
      x: -14.5,
      z: -4.85,
      status: 'seated',
      pressing: false,
      noise: 0,
      crack: 0,
      layer: 0,
      smallCracks: 0,
      bigCracks: 0,
      caughts: 0,
    },
    ejections: [],
  };
}

function welcome(worldId: string): WaxWelcome {
  return {
    type: 'welcome',
    worldId,
    you: 'me',
    layout: {
      hall: { minX: -17.5, maxX: 17.5, minZ: 0, maxZ: 4 },
      rooms: [],
      variants: [],
      doorWidth: 1.8,
      wallZ: 0,
    },
  };
}

describe('useWaxConnection', () => {
  const NativeWebSocket = globalThis.WebSocket;

  beforeEach(() => {
    window.localStorage.clear();
    jest.useFakeTimers();
    FakeSocket.instances = [];
    globalThis.WebSocket = FakeSocket as unknown as typeof WebSocket;
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    globalThis.WebSocket = NativeWebSocket;
  });

  it('창이 비활성화되면 누르기를 해제하고 반복 입력을 중단한다', () => {
    const { result, unmount } = renderHook(() => useWaxConnection());
    act(() => result.current.join());
    const socket = FakeSocket.instances[0];
    act(() => {
      socket.open();
      socket.receive(welcome('w1'));
      socket.receive(seatedState());
    });
    act(() => result.current.startPress());
    act(() => jest.advanceTimersByTime(800));
    expect(result.current.pressing).toBe(true);
    expect(socket.send).toHaveBeenCalledWith(JSON.stringify({ type: 'press', active: true }));
    act(() => window.dispatchEvent(new Event('blur')));
    expect(result.current.pressing).toBe(false);
    expect(socket.send).toHaveBeenLastCalledWith(JSON.stringify({ type: 'press', active: false }));
    const count = socket.send.mock.calls.length;
    act(() => jest.advanceTimersByTime(1500));
    expect(socket.send).toHaveBeenCalledTimes(count);
    unmount();
    expect(socket.close).toHaveBeenCalledTimes(1);
  });

  it('연결이 끊기면 자리를 초기화하고 이전 연결의 늦은 상태를 무시한다', () => {
    const { result, unmount } = renderHook(() => useWaxConnection());
    act(() => result.current.join());
    const first = FakeSocket.instances[0];
    act(() => {
      first.open();
      first.receive(seatedState());
      result.current.startPress();
    });
    act(() => first.close());
    expect(result.current.state).toBeNull();
    expect(result.current.pressing).toBe(false);
    expect(result.current.status).toBe('disconnected');
    act(() => result.current.join(false));
    const second = FakeSocket.instances[1];
    act(() => {
      second.open();
      second.receive(welcome('new-world'));
      second.receive(seatedState(20000));
    });
    act(() => first.receive(seatedState(30000)));
    expect(result.current.worldId).toBe('new-world');
    expect(result.current.state?.now).toBe(20000);
    unmount();
    const count = second.send.mock.calls.length;
    act(() => jest.advanceTimersByTime(20000));
    expect(second.send).toHaveBeenCalledTimes(count);
  });

  it('입장한 뒤 예기치 않게 끊기면 백오프 후 같은 교실로 다시 입장한다', () => {
    const { result, unmount } = renderHook(() => useWaxConnection());
    act(() => result.current.join());
    const first = FakeSocket.instances[0];
    act(() => {
      first.open();
      first.receive(welcome('w1'));
      first.receive(seatedState());
    });
    act(() => first.close());
    expect(result.current.status).toBe('reconnecting');
    // 재접속 중에도 레이아웃은 유지해 3D 장면을 내리지 않는다.
    expect(result.current.layout).not.toBeNull();
    expect(FakeSocket.instances).toHaveLength(1);
    act(() => jest.advanceTimersByTime(800));
    const second = FakeSocket.instances[1];
    act(() => second.open());
    expect(second.joined()).toEqual({ type: 'join', worldId: 'w1', token: expect.any(String) });
    act(() => {
      second.receive(welcome('w1'));
      second.receive(seatedState(20000));
    });
    expect(result.current.status).toBe('connected');
    unmount();
  });

  it('재접속 중 그 교실이 가득 차면 자리가 남은 교실로 들어간다', () => {
    const { result, unmount } = renderHook(() => useWaxConnection());
    act(() => result.current.join());
    const first = FakeSocket.instances[0];
    act(() => {
      first.open();
      first.receive(welcome('w1'));
    });
    act(() => first.close());
    act(() => jest.advanceTimersByTime(800));
    const second = FakeSocket.instances[1];
    act(() => {
      second.open();
      second.receive({ type: 'error', code: 'world_full', message: '가득 찼어요' });
    });
    expect(result.current.status).toBe('reconnecting');
    act(() => jest.advanceTimersByTime(1500));
    const third = FakeSocket.instances[2];
    act(() => third.open());
    expect(third.joined()).toEqual({ type: 'join', token: expect.any(String) });
    unmount();
  });

  it('재접속이 계속 실패하면 끊김 상태로 멈춘다', () => {
    const { result, unmount } = renderHook(() => useWaxConnection());
    act(() => result.current.join());
    const first = FakeSocket.instances[0];
    act(() => {
      first.open();
      first.receive(welcome('w1'));
    });
    act(() => first.close());
    for (let i = 0; i < 20 && result.current.status === 'reconnecting'; i++) {
      act(() => jest.advanceTimersByTime(8000));
      const latest = FakeSocket.instances.at(-1);
      act(() => latest?.close());
    }
    expect(result.current.status).toBe('disconnected');
    const attempts = FakeSocket.instances.length;
    act(() => jest.advanceTimersByTime(60000));
    expect(FakeSocket.instances).toHaveLength(attempts);
    unmount();
  });

  it('첫 입장이 거절되면 사유 코드를 알려주고 재접속하지 않는다', () => {
    const { result, unmount } = renderHook(() => useWaxConnection());
    act(() => result.current.join());
    const socket = FakeSocket.instances[0];
    act(() => {
      socket.open();
      socket.receive({
        type: 'error',
        code: 'world_full',
        message: '친구가 있는 교실이 가득 찼어요.',
      });
    });
    expect(result.current.status).toBe('error');
    expect(result.current.errorCode).toBe('world_full');
    act(() => jest.advanceTimersByTime(30000));
    expect(FakeSocket.instances).toHaveLength(1);
    unmount();
  });

  it('서버가 생략한 seat·pressing·emote를 기본값으로 채운다', () => {
    const { result, unmount } = renderHook(() => useWaxConnection());
    act(() => result.current.join());
    const socket = FakeSocket.instances[0];
    act(() => {
      socket.open();
      socket.receive({
        ...seatedState(),
        players: [
          {
            id: 'a',
            name: '말차',
            character: 'female-b',
            x: 0,
            z: 0,
            yaw: 0,
            room: 0,
            status: 'walking',
          },
        ],
      });
    });
    expect(result.current.state?.players[0]).toMatchObject({
      seat: null,
      pressing: false,
      emote: null,
    });
    unmount();
  });

  it('입력이 없어 내보내지면(idle 공지) 재접속하지 않고 idle 상태가 된다', () => {
    const { result, unmount } = renderHook(() => useWaxConnection());
    act(() => result.current.join());
    const socket = FakeSocket.instances[0];
    act(() => {
      socket.open();
      socket.receive({ ...welcome('w1'), idleTimeoutMs: 300000 });
      socket.receive(seatedState());
    });
    expect(result.current.idleTimeoutMs).toBe(300000);
    act(() => {
      socket.receive({
        type: 'notice',
        code: 'idle',
        message: '오래 움직이지 않아 교실에서 나왔어요.',
      });
      socket.close();
    });
    expect(result.current.status).toBe('idle');
    act(() => jest.advanceTimersByTime(60000));
    expect(FakeSocket.instances).toHaveLength(1);
    unmount();
  });

  it('화면 입력 알림(active)은 10초에 한 번만 보내고, 다른 명령도 활동으로 친다', () => {
    const { result, unmount } = renderHook(() => useWaxConnection());
    act(() => result.current.join());
    const socket = FakeSocket.instances[0];
    act(() => {
      socket.open();
      socket.receive(welcome('w1'));
    });
    const actives = () =>
      socket.send.mock.calls.filter(([raw]) => JSON.parse(raw).type === 'active').length;
    // 입장 직후는 방금 활동한 것으로 본다.
    act(() => result.current.reportActivity());
    expect(actives()).toBe(0);
    act(() => jest.advanceTimersByTime(10000));
    act(() => {
      result.current.reportActivity();
      result.current.reportActivity();
    });
    expect(actives()).toBe(1);
    act(() => jest.advanceTimersByTime(10000));
    act(() => result.current.emote('wave'));
    act(() => result.current.reportActivity());
    expect(actives()).toBe(1);
    const before = result.current.lastActiveAt.current;
    act(() => jest.advanceTimersByTime(10000));
    // heartbeat(10초마다)는 활동으로 치지 않는다.
    expect(result.current.lastActiveAt.current).toBe(before);
    unmount();
  });

  it('입장 정보를 받고, 이동은 80ms마다 바뀐 값만 보내며 걷는 중에는 누르기를 보내지 않는다', () => {
    const now = jest.spyOn(performance, 'now');
    const { result, unmount } = renderHook(() => useWaxConnection());
    act(() => result.current.join());
    const socket = FakeSocket.instances[0];
    act(() => {
      socket.open();
      socket.receive(welcome('w1'));
      socket.receive({
        ...seatedState(),
        you: { ...seatedState().you, seat: null, status: 'walking' },
      });
    });
    expect(result.current.myId).toBe('me');
    expect(result.current.layout?.doorWidth).toBe(1.8);
    now.mockReturnValue(1000);
    act(() => result.current.sendMove(1, 2, 0));
    now.mockReturnValue(1030);
    act(() => result.current.sendMove(1.5, 2, 0));
    now.mockReturnValue(1100);
    act(() => result.current.sendMove(1.5, 2, 0));
    act(() => result.current.sendMove(1.5, 2, 0));
    const moves = socket.send.mock.calls
      .map(([raw]) => JSON.parse(raw))
      .filter((message) => message.type === 'move');
    expect(moves).toEqual([
      { type: 'move', x: 1, z: 2, yaw: 0 },
      { type: 'move', x: 1.5, z: 2, yaw: 0 },
    ]);
    act(() => {
      result.current.startPress();
    });
    expect(socket.send).not.toHaveBeenCalledWith(JSON.stringify({ type: 'press', active: true }));
    act(() => result.current.sit(1, 3));
    expect(socket.send).toHaveBeenLastCalledWith(JSON.stringify({ type: 'sit', room: 1, seat: 3 }));
    now.mockRestore();
    unmount();
  });
  it('prepare는 연결만 하고 추천 닉네임을 받은 뒤, 이름을 고르면 그 이름과 기기 토큰으로 입장한다', () => {
    const { result, unmount } = renderHook(() => useWaxConnection());
    act(() => result.current.prepare());
    const socket = FakeSocket.instances[0];
    act(() => socket.open());
    expect(socket.joined()).toBeUndefined();
    act(() => socket.receive({ type: 'hello', suggestion: '수상한 복학생' }));
    expect(result.current.suggestion).toBe('수상한 복학생');
    expect(result.current.status).toBe('naming');
    act(() => result.current.enter('왁뿌볼고수'));
    const join = socket.joined();
    expect(join).toEqual({ type: 'join', name: '왁뿌볼고수', token: expect.any(String) });
    expect(join.token).toMatch(/^[A-Za-z0-9-]{16,64}$/);
    // 같은 기기는 같은 토큰을 쓴다.
    expect(window.localStorage.getItem('wax:device-token')).toBe(join.token);
    // 직접 입력한 이름은 서버가 입장을 받아준 뒤에 저장한다.
    expect(window.localStorage.getItem('wax:nickname')).toBeNull();
    act(() => socket.receive(welcome('w1')));
    expect(window.localStorage.getItem('wax:nickname')).toBe('왁뿌볼고수');
    unmount();
  });

  it('서버가 닉네임을 거절하면 연결을 유지한 채 사유를 알려주고, 다시 고르면 같은 연결로 입장한다', () => {
    const { result, unmount } = renderHook(() => useWaxConnection());
    act(() => result.current.prepare());
    const socket = FakeSocket.instances[0];
    act(() => {
      socket.open();
      socket.receive({ type: 'hello', suggestion: '수상한 복학생' });
    });
    act(() => result.current.enter('특수!'));
    act(() =>
      socket.receive({
        type: 'error',
        code: 'invalid_name',
        message: '닉네임은 2~8자의 한글·영문·숫자로 정해주세요.',
      }),
    );
    expect(result.current.nameError).toContain('2~8자');
    expect(result.current.status).toBe('naming');
    expect(socket.close).not.toHaveBeenCalled();
    // 거절된 이름은 다음 방문 때 미리 채우지 않도록 저장하지 않는다.
    expect(window.localStorage.getItem('wax:nickname')).toBeNull();
    act(() => result.current.enter('수상한 복학생'));
    expect(result.current.nameError).toBe('');
    const joins = socket.send.mock.calls
      .map(([raw]) => JSON.parse(raw))
      .filter((m) => m.type === 'join');
    expect(joins.at(-1)).toMatchObject({ name: '수상한 복학생' });
    expect(FakeSocket.instances).toHaveLength(1);
    unmount();
  });

  it('모달에 머무는 동안 연결이 끊겨도 끊김 화면 없이 기다리고, 이름을 고르면 다시 연결해 바로 입장한다', () => {
    const { result, unmount } = renderHook(() => useWaxConnection());
    act(() => result.current.prepare());
    const first = FakeSocket.instances[0];
    act(() => {
      first.open();
      first.receive({ type: 'hello', suggestion: '수상한 복학생' });
    });
    act(() => first.close());
    expect(result.current.status).toBe('naming');
    act(() => jest.advanceTimersByTime(30000));
    expect(FakeSocket.instances).toHaveLength(1);
    act(() => result.current.enter('왁뿌볼고수'));
    const second = FakeSocket.instances[1];
    act(() => second.open());
    expect(second.joined()).toMatchObject({ type: 'join', name: '왁뿌볼고수' });
    unmount();
  });

  it('이름을 보낸 뒤 입장(welcome) 전에 끊기면 고른 이름으로 다시 연결해 입장한다', () => {
    const { result, unmount } = renderHook(() => useWaxConnection());
    act(() => result.current.prepare());
    const first = FakeSocket.instances[0];
    act(() => {
      first.open();
      first.receive({ type: 'hello', suggestion: '수상한 복학생' });
    });
    act(() => result.current.enter('왁뿌볼고수'));
    act(() => first.close());
    // 모달은 이미 닫혔으므로 이름 고르기 상태로 멈추지 않고 재접속한다.
    expect(result.current.status).toBe('reconnecting');
    act(() => jest.advanceTimersByTime(800));
    const second = FakeSocket.instances[1];
    act(() => second.open());
    expect(second.joined()).toMatchObject({ type: 'join', name: '왁뿌볼고수' });
    act(() => second.receive(welcome('w1')));
    expect(result.current.worldId).toBe('w1');
    unmount();
  });

  it('닉네임이 거절된 뒤 모달에 머무는 동안 끊기면 거절된 이름으로 재접속하지 않고 기다린다', () => {
    const { result, unmount } = renderHook(() => useWaxConnection());
    act(() => result.current.prepare());
    const first = FakeSocket.instances[0];
    act(() => first.open());
    act(() => result.current.enter('특수!'));
    act(() => first.receive({ type: 'error', code: 'invalid_name', message: '거절' }));
    act(() => first.close());
    expect(result.current.status).toBe('naming');
    act(() => jest.advanceTimersByTime(30000));
    expect(FakeSocket.instances).toHaveLength(1);
    unmount();
  });

  it('입장한 뒤 끊겨 다시 들어갈 때도 고른 이름으로 입장한다', () => {
    const { result, unmount } = renderHook(() => useWaxConnection());
    act(() => result.current.prepare());
    const first = FakeSocket.instances[0];
    act(() => first.open());
    act(() => result.current.enter('왁뿌볼고수'));
    act(() => first.receive(welcome('w1')));
    act(() => first.close());
    act(() => jest.advanceTimersByTime(800));
    const second = FakeSocket.instances[1];
    act(() => second.open());
    expect(second.joined()).toMatchObject({ worldId: 'w1', name: '왁뿌볼고수' });
    unmount();
  });

  it('모달을 닫으면 입장하지 않은 연결을 닫는다', () => {
    const { result, unmount } = renderHook(() => useWaxConnection());
    act(() => result.current.prepare());
    const socket = FakeSocket.instances[0];
    act(() => socket.open());
    act(() => result.current.cancelNaming());
    expect(socket.close).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe('idle');
    unmount();
  });
  it('입장(welcome) 전에는 게임 명령을 보내지 않아 닉네임을 고르는 동안 연결이 끊기지 않는다', () => {
    const { result, unmount } = renderHook(() => useWaxConnection());
    act(() => result.current.prepare());
    const socket = FakeSocket.instances[0];
    act(() => {
      socket.open();
      socket.receive({ type: 'hello', suggestion: '수상한 복학생' });
    });
    act(() => {
      result.current.stand();
      result.current.emote('wave');
      result.current.sit(1, 0);
      result.current.sendMove(1, 2, 0);
    });
    expect(socket.send).not.toHaveBeenCalled();
    expect(result.current.status).toBe('naming');
    act(() => result.current.enter('왁뿌볼고수'));
    act(() => socket.receive(welcome('w1')));
    act(() => result.current.emote('wave'));
    expect(socket.send).toHaveBeenLastCalledWith(JSON.stringify({ type: 'emote', kind: 'wave' }));
    unmount();
  });
});
