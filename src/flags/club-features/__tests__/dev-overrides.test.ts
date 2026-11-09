import {
  isDevFlagOverrideEnabled,
  parseDevFlagOverrides,
} from '@/flags/club-features/dev-overrides';

const encode = (value: unknown) => encodeURIComponent(JSON.stringify(value));

describe('parseDevFlagOverrides', () => {
  it('등록된 플래그의 boolean 값을 읽는다', () => {
    expect(parseDevFlagOverrides(encode({ warningEnabled: true }))).toEqual({
      warningEnabled: true,
    });
  });

  it('인코딩하지 않은 JSON도 읽는다', () => {
    expect(parseDevFlagOverrides('{"warningEnabled":false}')).toEqual({ warningEnabled: false });
  });

  it('등록되지 않은 키와 boolean이 아닌 값은 버린다', () => {
    expect(parseDevFlagOverrides(encode({ unknownEnabled: true, warningEnabled: 'true' }))).toEqual(
      {},
    );
  });

  it.each([undefined, '', 'not-json', encode(['warningEnabled']), encode(null)])(
    '형식이 잘못되면 빈 객체를 돌려준다 (%p)',
    (raw) => {
      expect(parseDevFlagOverrides(raw)).toEqual({});
    },
  );
});

describe('isDevFlagOverrideEnabled', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    Object.assign(process.env, { NODE_ENV: originalEnv });
  });

  it.each([
    ['development', true],
    ['production', false],
    ['test', false],
  ])('NODE_ENV=%s이면 %p', (nodeEnv, expected) => {
    Object.assign(process.env, { NODE_ENV: nodeEnv });
    expect(isDevFlagOverrideEnabled()).toBe(expected);
  });
});
