import { findGrains, WaxAudio } from '@/lib/minigame/waxAudio';

const MANIFEST = {
  banks: {
    apple: ['wakppu/apple_crack_1.mp3', 'wakppu/apple_crack_2.mp3'],
    'apple-knead': 'wakppu/apple_knead_1.mp3',
  },
  variants: [{ bank: 'apple', knead: 'apple-knead', rate: 1.1 }],
  whack: ['whack-1.mp3'],
  ambience: { classroom: 'ambience-classroom.mp3', hallway: 'ambience-hallway.mp3' },
  chalk: 'chalk.mp3',
};

/** 0.5초마다 짧게 탁 튀는 소리가 있는 가짜 녹음. */
function clickTrack(sampleRate = 8000, seconds = 3) {
  const samples = new Float32Array(sampleRate * seconds);
  for (let t = 0.25; t < seconds; t += 0.5) {
    const start = Math.floor(t * sampleRate);
    for (let i = 0; i < 200; i++) samples[start + i] = (t === 0.25 ? 0.9 : 0.3) * Math.exp(-i / 60);
  }
  return { sampleRate, duration: seconds, getChannelData: () => samples } as unknown as AudioBuffer;
}

function audioContext() {
  const sources: { start: jest.Mock; stop: jest.Mock }[] = [];
  const param = () => ({
    value: 1,
    setValueAtTime: jest.fn(),
    exponentialRampToValueAtTime: jest.fn(),
    setTargetAtTime: jest.fn(),
    cancelScheduledValues: jest.fn(),
  });
  const context = {
    state: 'running',
    currentTime: 0,
    destination: {},
    resume: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    decodeAudioData: jest.fn().mockResolvedValue(clickTrack()),
    createBufferSource: jest.fn(() => {
      const source = {
        connect: jest.fn((node) => node),
        disconnect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
        playbackRate: { value: 1 },
        buffer: null,
        loop: false,
        onended: null,
      };
      sources.push(source);
      return source;
    }),
    createGain: jest.fn(() => ({
      connect: jest.fn((node) => node),
      disconnect: jest.fn(),
      gain: param(),
    })),
  };
  return { context, sources };
}

function mockFetch(ok = true) {
  return jest.fn(async (url: string) => ({
    ok,
    json: async () => MANIFEST,
    arrayBuffer: async () => new ArrayBuffer(8),
    url,
  }));
}

describe('WaxAudio 녹음 조각 재생', () => {
  const originalContext = globalThis.AudioContext;
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.AudioContext = originalContext;
    globalThis.fetch = originalFetch;
  });

  it('banks.json이 가리키는 녹음을 받고, 큰 깨짐은 작은 균열보다 많은 조각을 겹친다', async () => {
    const { context, sources } = audioContext();
    globalThis.AudioContext = jest.fn(() => context) as unknown as typeof AudioContext;
    const fetchMock = mockFetch();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    const audio = new WaxAudio();
    await audio.enable();
    expect(fetchMock).toHaveBeenCalledWith('/audio/wax/banks.json');
    expect(fetchMock).toHaveBeenCalledWith('/audio/wax/wakppu/apple_crack_1.mp3');
    expect(fetchMock).toHaveBeenCalledWith('/audio/wax/wakppu/apple_crack_2.mp3');
    expect(audio.ready).toBe(true);

    const before = sources.length;
    audio.smallCrack(0);
    const small = sources.length - before;
    audio.bigCrack(0);
    const big = sources.length - before - small;
    expect(small).toBeGreaterThanOrEqual(1);
    expect(big).toBeGreaterThan(small);

    // 주무르는 소리는 다시 부르면 이전 구간을 멈추고 새로 시작한다.
    const beforeKnead = sources.length;
    audio.knead(0);
    const first = sources[beforeKnead];
    audio.knead(0);
    expect(sources.length).toBe(beforeKnead + 2);
    expect(first.stop).toHaveBeenCalled();
    audio.stopKnead();
    expect(sources.at(-1)!.stop).toHaveBeenCalled();

    audio.muted = true;
    const muted = sources.length;
    audio.bigCrack(0);
    audio.knead(0);
    audio.whack();
    expect(sources.length).toBe(muted);
    audio.close();
  });

  it('음원 다운로드 실패를 조용히 성공 처리하지 않는다', async () => {
    const { context } = audioContext();
    globalThis.AudioContext = jest.fn(() => context) as unknown as typeof AudioContext;
    globalThis.fetch = mockFetch(false) as unknown as typeof fetch;
    const audio = new WaxAudio();
    await expect(audio.enable()).rejects.toThrow(/소리/);
    expect(audio.ready).toBe(false);
    audio.close();
  });

  it('녹음에서 깨지는 순간을 찾고 음량 순으로 정렬한다', () => {
    const grains = findGrains(clickTrack());
    expect(grains).toHaveLength(6);
    expect(grains.at(-1)?.offset).toBeCloseTo(0.25, 1);
    expect(grains[0].peak).toBeLessThan(grains.at(-1)!.peak);
  });
});

describe('WaxAudio 모바일 오디오 세션', () => {
  const originalContext = globalThis.AudioContext;
  const originalFetch = globalThis.fetch;
  const originalUserAgent = navigator.userAgent;
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;
  let play: jest.SpyInstance;

  function setUserAgent(value: string) {
    Object.defineProperty(navigator, 'userAgent', { value, configurable: true });
  }

  function setAudioSession(value: { type: string } | undefined) {
    Object.defineProperty(navigator, 'audioSession', { value, configurable: true });
  }

  beforeEach(() => {
    URL.createObjectURL = jest.fn(() => 'blob:silence');
    URL.revokeObjectURL = jest.fn();
    play = jest.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    jest.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    globalThis.fetch = mockFetch() as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    globalThis.AudioContext = originalContext;
    globalThis.fetch = originalFetch;
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    setUserAgent(originalUserAgent);
    setAudioSession(undefined);
  });

  it('Audio Session API가 있으면 소리를 켤 때 무음 스위치를 무시하는 playback 세션으로 바꾼다', async () => {
    const { context } = audioContext();
    globalThis.AudioContext = jest.fn(() => context) as unknown as typeof AudioContext;
    const session = { type: 'auto' };
    setAudioSession(session);
    const audio = new WaxAudio();
    await audio.enable();
    expect(session.type).toBe('playback');
    expect(play).not.toHaveBeenCalled();
    audio.close();
  });

  it('Audio Session API가 없는 iOS는 무음 오디오를 반복 재생해 세션을 바꾸고, 닫으면 정리한다', async () => {
    const { context } = audioContext();
    globalThis.AudioContext = jest.fn(() => context) as unknown as typeof AudioContext;
    setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_7 like Mac OS X) AppleWebKit/605.1.15');
    const audio = new WaxAudio();
    await audio.enable();
    expect(play).toHaveBeenCalledTimes(1);
    const element = play.mock.contexts[0] as HTMLAudioElement;
    expect(element.loop).toBe(true);
    expect(element.hasAttribute('playsinline')).toBe(true);
    audio.close();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:silence');
  });

  it('iOS가 아니면 무음 오디오를 재생하지 않는다', async () => {
    const { context } = audioContext();
    globalThis.AudioContext = jest.fn(() => context) as unknown as typeof AudioContext;
    setUserAgent('Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130 Mobile');
    const audio = new WaxAudio();
    await audio.enable();
    expect(play).not.toHaveBeenCalled();
    audio.close();
  });

  it('앱 전환 등으로 멈춘 재생은 resume()에서 다시 살리고, 재생 중이면 건드리지 않는다', async () => {
    const { context } = audioContext();
    globalThis.AudioContext = jest.fn(() => context) as unknown as typeof AudioContext;
    const audio = new WaxAudio();
    await audio.enable();
    context.resume.mockClear();

    audio.resume();
    expect(context.resume).not.toHaveBeenCalled();

    context.state = 'interrupted';
    audio.resume();
    expect(context.resume).toHaveBeenCalledTimes(1);
    audio.close();
  });
});
