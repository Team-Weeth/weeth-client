import {
  isDevFlagOverrideEnabled,
  MAX_DEV_FLAG_OVERRIDES,
  parseDevFlagOverrides,
  serializeDevFlagOverrides,
  toDevFlagOverrides,
} from '@/flags/club-features/dev-overrides';

const encode = (value: unknown) => encodeURIComponent(JSON.stringify(value));

describe('parseDevFlagOverrides', () => {
  it('플래그 이름별 boolean 값을 읽는다', () => {
    expect(parseDevFlagOverrides(encode({ club_warning_enabled: true, new_flag: false }))).toEqual({
      club_warning_enabled: true,
      new_flag: false,
    });
  });

  it('인코딩하지 않은 JSON도 읽는다', () => {
    expect(parseDevFlagOverrides('{"club_warning_enabled":false}')).toEqual({
      club_warning_enabled: false,
    });
  });

  it('형식에 맞지 않는 이름과 boolean이 아닌 값은 버린다', () => {
    expect(
      parseDevFlagOverrides(encode({ 'bad key': true, '<script>': true, ok_flag: 'true' })),
    ).toEqual({});
  });

  it(`최대 ${MAX_DEV_FLAG_OVERRIDES}개까지만 읽는다`, () => {
    const many = Object.fromEntries(
      Array.from({ length: MAX_DEV_FLAG_OVERRIDES + 5 }, (_, i) => [`flag_${i}`, true]),
    );
    expect(Object.keys(parseDevFlagOverrides(encode(many)))).toHaveLength(MAX_DEV_FLAG_OVERRIDES);
  });

  it.each([undefined, '', 'not-json', encode(['club_warning_enabled']), encode(null)])(
    '형식이 잘못되면 빈 객체를 돌려준다 (%p)',
    (raw) => {
      expect(parseDevFlagOverrides(raw)).toEqual({});
    },
  );
});

describe('serializeDevFlagOverrides', () => {
  it('parseDevFlagOverrides로 다시 읽을 수 있는 값을 만든다', () => {
    const overrides = { club_warning_enabled: true };
    expect(parseDevFlagOverrides(serializeDevFlagOverrides(overrides))).toEqual(overrides);
  });
});

describe('toDevFlagOverrides', () => {
  it('ClubFeatures 속성명을 플래그 이름으로 바꾼다', () => {
    expect(toDevFlagOverrides({ warningEnabled: true })).toEqual({ club_warning_enabled: true });
  });
});

describe('isDevFlagOverrideEnabled', () => {
  const ENV_KEYS = ['NODE_ENV', 'NEXT_PUBLIC_APP_ENV', 'ENABLE_DEV_FLAG_OVERRIDES'] as const;
  const originalEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

  function setEnv(env: Partial<Record<(typeof ENV_KEYS)[number], string>>) {
    for (const key of ENV_KEYS) {
      if (env[key] === undefined) delete process.env[key];
      else Object.assign(process.env, { [key]: env[key] });
    }
  }

  afterEach(() => {
    setEnv(originalEnv);
  });

  it.each([
    ['로컬 dev 서버', { NODE_ENV: 'development' }, true],
    [
      '로컬 dev 서버 (APP_ENV=development)',
      { NODE_ENV: 'development', NEXT_PUBLIC_APP_ENV: 'development' },
      true,
    ],
    [
      'dev 배포 (명시적으로 켬)',
      {
        NODE_ENV: 'production',
        NEXT_PUBLIC_APP_ENV: 'development',
        ENABLE_DEV_FLAG_OVERRIDES: 'true',
      },
      true,
    ],
    ['dev 배포 (설정 없음)', { NODE_ENV: 'production', NEXT_PUBLIC_APP_ENV: 'development' }, false],
    ['APP_ENV 없는 프로덕션 빌드', { NODE_ENV: 'production' }, false],
    [
      '운영 배포에 켜는 값이 잘못 들어간 경우',
      {
        NODE_ENV: 'production',
        NEXT_PUBLIC_APP_ENV: 'production',
        ENABLE_DEV_FLAG_OVERRIDES: 'true',
      },
      false,
    ],
    [
      '운영 env로 띄운 로컬 dev 서버',
      { NODE_ENV: 'development', NEXT_PUBLIC_APP_ENV: 'production' },
      false,
    ],
    ['Jest', { NODE_ENV: 'test' }, false],
  ])('%s이면 %p', (_name, env, expected) => {
    setEnv(env);
    expect(isDevFlagOverrideEnabled()).toBe(expected);
  });
});
