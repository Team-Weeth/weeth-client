import { expect, test as base, type Locator, type Page, type TestInfo } from '@playwright/test';

import type { ClubFeatures } from '../../src/flags/club-features/definitions';
import {
  DEV_FLAG_OVERRIDE_COOKIE,
  serializeDevFlagOverrides,
  toDevFlagOverrides,
} from '../../src/flags/club-features/dev-overrides';

/**
 * Figma 대비 디자인 검증 헬퍼.
 *
 * Figma에서 읽은 값(크기·여백·타이포·색·그림자)을 기대값으로 적고, 실제 브라우저의
 * 레이아웃 박스와 computed style을 측정해 비교한다. 결과는 표로 남기므로
 * "추정으로 고치고 눈으로 확인"하는 대신 숫자로 차이를 확인할 수 있다.
 * 사용 흐름은 `.claude/skills/figma-verify/SKILL.md` 참고.
 */

/** Figma 프레임 크기에 맞춘 뷰포트. 디자인 프레임이 다르면 해당 크기를 직접 넘긴다. */
export const FIGMA_VIEWPORTS = {
  mobile: { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true },
  desktop: { viewport: { width: 1440, height: 1024 } },
} as const;

export interface ShadowSpec {
  x: number;
  y: number;
  blur: number;
  spread?: number;
  /** hex(#RRGGBBAA 포함)·rgb()·var(--token) 등 CSS 색 값 */
  color: string;
  inset?: boolean;
}

/** 모든 길이 단위는 px. 지정한 속성만 비교한다. */
export interface DesignSpec {
  width?: number;
  height?: number;
  /** 뷰포트 가장자리까지의 거리 (FAB·바텀시트 위치 확인용) */
  offsetTop?: number;
  offsetRight?: number;
  offsetBottom?: number;
  offsetLeft?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  /** flex/grid의 row-gap (Figma auto layout 세로 간격) */
  rowGap?: number;
  /** flex/grid의 column-gap (Figma auto layout 가로 간격) */
  columnGap?: number;
  borderRadius?: number;
  borderWidth?: number;
  fontSize?: number;
  lineHeight?: number;
  letterSpacing?: number;
  fontWeight?: number;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  /** 'none'이면 그림자가 없어야 한다. 투명한 그림자 레이어(Tailwind 기본값)는 무시한다. */
  boxShadow?: ShadowSpec[] | 'none';
  /** 텍스트 요소의 실제 줄 수 (의도치 않은 줄바꿈 확인용) */
  lines?: number;
}

export interface SpacingSpec {
  /** 앞 요소 아래 끝 → 뒤 요소 위 끝 */
  vertical?: number;
  /** 앞 요소 오른쪽 끝 → 뒤 요소 왼쪽 끝 */
  horizontal?: number;
}

export interface CheckOptions {
  /** 길이 허용 오차(px). 서브픽셀 반올림 때문에 기본 1px */
  tolerance?: number;
}

type Rgba = [number, number, number, number];

interface MeasuredShadow {
  x: number;
  y: number;
  blur: number;
  spread: number;
  inset: boolean;
  color: Rgba;
}

interface Measurement {
  lengths: Record<string, number>;
  fontWeight: number;
  colors: Record<'color' | 'backgroundColor' | 'borderColor', Rgba>;
  boxShadow: MeasuredShadow[];
  lines: number;
  resolvedColors: (Rgba | null)[];
}

interface ReportRow {
  target: string;
  property: string;
  expected: string;
  actual: string;
  pass: boolean;
}

const LENGTH_KEYS = [
  'width',
  'height',
  'offsetTop',
  'offsetRight',
  'offsetBottom',
  'offsetLeft',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'rowGap',
  'columnGap',
  'borderRadius',
  'borderWidth',
  'fontSize',
  'lineHeight',
  'letterSpacing',
] as const;
const COLOR_KEYS = ['color', 'backgroundColor', 'borderColor'] as const;
const COLOR_CHANNEL_TOLERANCE = 2;
const ALPHA_TOLERANCE = 0.02;
const SHADOW_LENGTH_TOLERANCE = 0.5;

/**
 * 브라우저 안에서 실행된다. 직렬화되어 전달되므로 바깥 스코프를 참조하지 않는다.
 * 색은 캔버스에 칠해 픽셀을 읽어 sRGB로 통일한다 (oklch·color-mix·var() 모두 같은 기준으로 비교).
 */
function measureInPage(el: Element, expectedColors: string[]): Measurement {
  const cs = getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  const px = (value: string) => {
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const fontSize = px(cs.fontSize);
  const lineHeight = cs.lineHeight === 'normal' ? fontSize * 1.2 : px(cs.lineHeight);

  const tops: number[] = [];
  const range = document.createRange();
  range.selectNodeContents(el);
  for (const lineRect of Array.from(range.getClientRects())) {
    if (lineRect.width === 0 || lineRect.height === 0) continue;
    if (!tops.some((top) => Math.abs(top - lineRect.top) < lineHeight / 2)) tops.push(lineRect.top);
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  // var(--token)을 요소와 같은 테마 스코프에서 풀기 위해 부모 아래에 숨긴 probe를 붙인다.
  const probe = document.createElement('span');
  probe.style.display = 'none';
  (el.parentElement ?? document.body).appendChild(probe);

  const toRgba = (value: string): Rgba | null => {
    if (!ctx || !CSS.supports('color', value)) return null;
    probe.style.color = '';
    probe.style.color = value;
    const resolved = getComputedStyle(probe).color;
    // sRGB 색은 문자열 그대로 읽는다. 캔버스는 반투명 색을 premultiply해서 채널 값이 몇씩 틀어진다.
    const rgb = resolved.match(/^rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)$/);
    if (rgb) {
      return [
        Number(rgb[1]),
        Number(rgb[2]),
        Number(rgb[3]),
        rgb[4] === undefined ? 1 : Number(rgb[4]),
      ];
    }
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillStyle = resolved;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = Array.from(ctx.getImageData(0, 0, 1, 1).data);
    return [r, g, b, Math.round((a / 255) * 100) / 100];
  };
  const transparent: Rgba = [0, 0, 0, 0];

  const splitLayers = (value: string) => {
    const layers: string[] = [];
    let depth = 0;
    let current = '';
    for (const ch of value) {
      if (ch === '(') depth += 1;
      if (ch === ')') depth -= 1;
      if (ch === ',' && depth === 0) {
        layers.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    if (current.trim()) layers.push(current.trim());
    return layers;
  };

  const boxShadow =
    cs.boxShadow === 'none'
      ? []
      : splitLayers(cs.boxShadow)
          .map((layer) => {
            const colorToken = layer.match(/[a-z-]+\([^)]*\)|#[0-9a-f]{3,8}\b/i)?.[0];
            const rest = colorToken ? layer.replace(colorToken, '') : layer;
            const lengths = Array.from(rest.matchAll(/(-?[\d.]+)px/g)).map((m) => parseFloat(m[1]));
            return {
              x: lengths[0] ?? 0,
              y: lengths[1] ?? 0,
              blur: lengths[2] ?? 0,
              spread: lengths[3] ?? 0,
              inset: /\binset\b/.test(rest),
              color: (colorToken ? toRgba(colorToken) : null) ?? ([0, 0, 0, 1] as Rgba),
            };
          })
          .filter((shadow) => shadow.color[3] > 0);

  const measurement: Measurement = {
    lengths: {
      width: rect.width,
      height: rect.height,
      offsetTop: rect.top,
      offsetRight: window.innerWidth - rect.right,
      offsetBottom: window.innerHeight - rect.bottom,
      offsetLeft: rect.left,
      paddingTop: px(cs.paddingTop),
      paddingRight: px(cs.paddingRight),
      paddingBottom: px(cs.paddingBottom),
      paddingLeft: px(cs.paddingLeft),
      rowGap: px(cs.rowGap),
      columnGap: px(cs.columnGap),
      // rounded-full은 calc(infinity * 1px)로 계산되므로 실제로 보이는 반경(짧은 변의 절반)으로 자른다.
      borderRadius: Math.min(px(cs.borderTopLeftRadius), rect.width / 2, rect.height / 2),
      borderWidth: px(cs.borderTopWidth),
      fontSize,
      lineHeight,
      letterSpacing: px(cs.letterSpacing),
    },
    fontWeight: Number(cs.fontWeight),
    colors: {
      color: toRgba(cs.color) ?? transparent,
      backgroundColor: toRgba(cs.backgroundColor) ?? transparent,
      borderColor: toRgba(cs.borderTopColor) ?? transparent,
    },
    boxShadow,
    lines: tops.length,
    resolvedColors: expectedColors.map(toRgba),
  };

  probe.remove();
  return measurement;
}

function formatRgba([r, g, b, a]: Rgba) {
  const hex = [r, g, b].map((channel) => channel.toString(16).padStart(2, '0')).join('');
  const alpha =
    a >= 1
      ? ''
      : Math.round(a * 255)
          .toString(16)
          .padStart(2, '0');
  return `#${hex}${alpha}`.toUpperCase();
}

function sameColor(actual: Rgba, expected: Rgba) {
  if (actual[3] === 0 && expected[3] === 0) return true;
  return (
    actual
      .slice(0, 3)
      .every((channel, i) => Math.abs(channel - expected[i]) <= COLOR_CHANNEL_TOLERANCE) &&
    Math.abs(actual[3] - expected[3]) <= ALPHA_TOLERANCE
  );
}

function formatShadow(
  shadow: { x: number; y: number; blur: number; spread: number; inset: boolean },
  color: string,
) {
  return `${shadow.inset ? 'inset ' : ''}${shadow.x} ${shadow.y} ${shadow.blur} ${shadow.spread} ${color}`;
}

function toMarkdown(rows: ReportRow[]) {
  const lines = [
    '| 대상 | 속성 | Figma | 실제 | 결과 |',
    '| --- | --- | --- | --- | --- |',
    ...rows.map(
      (row) =>
        `| ${row.target} | ${row.property} | ${row.expected} | ${row.actual} | ${row.pass ? '✅' : '❌'} |`,
    ),
  ];
  return lines.join('\n');
}

/** 레이아웃이 애니메이션 중이면 측정값이 흔들리므로 박스가 멈출 때까지 기다린다. */
async function waitForStableBox(locator: Locator, timeout = 3_000) {
  await locator.waitFor({ state: 'visible' });
  const deadline = Date.now() + timeout;
  let previous = await locator.boundingBox();
  while (Date.now() < deadline) {
    await locator.page().waitForTimeout(100);
    const current = await locator.boundingBox();
    if (
      previous &&
      current &&
      Math.abs(previous.x - current.x) < 0.5 &&
      Math.abs(previous.y - current.y) < 0.5 &&
      Math.abs(previous.width - current.width) < 0.5 &&
      Math.abs(previous.height - current.height) < 0.5
    ) {
      return;
    }
    previous = current;
  }
}

export class DesignChecker {
  private readonly rows: ReportRow[] = [];

  constructor(
    private readonly page: Page,
    private readonly testInfo: TestInfo,
  ) {}

  /** 요소 하나를 Figma 값과 비교한다. 불일치가 있어도 테스트를 멈추지 않고(soft) 끝까지 측정한다. */
  async check(target: string, locator: Locator, spec: DesignSpec, options: CheckOptions = {}) {
    const tolerance = options.tolerance ?? 1;
    await this.page.evaluate(() => document.fonts.ready.then(() => true));
    await waitForStableBox(locator);

    const shadowSpecs = Array.isArray(spec.boxShadow) ? spec.boxShadow : [];
    const expectedColors = [
      ...COLOR_KEYS.map((key) => spec[key] ?? 'transparent'),
      ...shadowSpecs.map((shadow) => shadow.color),
    ];
    const measured = await locator.evaluate(measureInPage, expectedColors);

    const rows: ReportRow[] = [];
    const add = (property: string, expected: string, actual: string, pass: boolean) =>
      rows.push({ target, property, expected, actual, pass });

    for (const key of LENGTH_KEYS) {
      const expected = spec[key];
      if (expected === undefined) continue;
      const actual = Math.round(measured.lengths[key] * 100) / 100;
      add(key, `${expected}px`, `${actual}px`, Math.abs(actual - expected) <= tolerance);
    }
    if (spec.fontWeight !== undefined) {
      add(
        'fontWeight',
        String(spec.fontWeight),
        String(measured.fontWeight),
        measured.fontWeight === spec.fontWeight,
      );
    }
    if (spec.lines !== undefined) {
      add('lines', String(spec.lines), String(measured.lines), measured.lines === spec.lines);
    }
    COLOR_KEYS.forEach((key, index) => {
      const raw = spec[key];
      if (raw === undefined) return;
      const expected = measured.resolvedColors[index];
      const actual = measured.colors[key];
      add(
        key,
        expected ? `${formatRgba(expected)} (${raw})` : `해석 불가: ${raw}`,
        formatRgba(actual),
        expected !== null && sameColor(actual, expected),
      );
    });
    if (spec.boxShadow !== undefined) {
      const actualText =
        measured.boxShadow.map((s) => formatShadow(s, formatRgba(s.color))).join(', ') || 'none';
      if (spec.boxShadow === 'none') {
        add('boxShadow', 'none', actualText, measured.boxShadow.length === 0);
      } else {
        const expectedColorsOffset = COLOR_KEYS.length;
        const expectedText = shadowSpecs
          .map((s) =>
            formatShadow({ ...s, spread: s.spread ?? 0, inset: s.inset ?? false }, s.color),
          )
          .join(', ');
        const pass =
          measured.boxShadow.length === shadowSpecs.length &&
          shadowSpecs.every((s, i) => {
            const actual = measured.boxShadow[i];
            const expectedColor = measured.resolvedColors[expectedColorsOffset + i];
            return (
              Math.abs(actual.x - s.x) <= SHADOW_LENGTH_TOLERANCE &&
              Math.abs(actual.y - s.y) <= SHADOW_LENGTH_TOLERANCE &&
              Math.abs(actual.blur - s.blur) <= SHADOW_LENGTH_TOLERANCE &&
              Math.abs(actual.spread - (s.spread ?? 0)) <= SHADOW_LENGTH_TOLERANCE &&
              actual.inset === (s.inset ?? false) &&
              expectedColor !== null &&
              sameColor(actual.color, expectedColor)
            );
          });
        add('boxShadow', expectedText, actualText, pass);
      }
    }

    this.record(target, rows);
  }

  /** 두 요소 사이 간격을 비교한다. Figma에서 서로 다른 프레임에 속한 요소의 간격을 확인할 때 쓴다. */
  async spacing(
    target: string,
    from: Locator,
    to: Locator,
    spec: SpacingSpec,
    options: CheckOptions = {},
  ) {
    const tolerance = options.tolerance ?? 1;
    await waitForStableBox(from);
    await waitForStableBox(to);
    const [a, b] = await Promise.all([from.boundingBox(), to.boundingBox()]);
    if (!a || !b) throw new Error(`${target}: 요소의 박스를 측정할 수 없습니다`);

    const rows: ReportRow[] = [];
    if (spec.vertical !== undefined) {
      const actual = Math.round((b.y - (a.y + a.height)) * 100) / 100;
      rows.push({
        target,
        property: 'vertical',
        expected: `${spec.vertical}px`,
        actual: `${actual}px`,
        pass: Math.abs(actual - spec.vertical) <= tolerance,
      });
    }
    if (spec.horizontal !== undefined) {
      const actual = Math.round((b.x - (a.x + a.width)) * 100) / 100;
      rows.push({
        target,
        property: 'horizontal',
        expected: `${spec.horizontal}px`,
        actual: `${actual}px`,
        pass: Math.abs(actual - spec.horizontal) <= tolerance,
      });
    }
    this.record(target, rows);
  }

  /** 육안 비교용 스크린샷을 남긴다. 대상이 없으면 전체 화면을 찍는다. */
  async screenshot(name: string, target?: Locator) {
    const path = this.testInfo.outputPath(`${name}.png`);
    if (target) {
      await waitForStableBox(target);
      await target.screenshot({ path });
    } else {
      await this.page.screenshot({ path });
    }
    await this.testInfo.attach(name, { path, contentType: 'image/png' });
    return path;
  }

  /** 테스트가 끝나면 전체 비교표를 첨부하고 콘솔에도 출력한다. */
  async attachReport() {
    if (this.rows.length === 0) return;
    const markdown = toMarkdown(this.rows);
    const path = this.testInfo.outputPath('design-report.md');
    const { writeFile } = await import('node:fs/promises');
    await writeFile(path, `# ${this.testInfo.title}\n\n${markdown}\n`);
    await this.testInfo.attach('design-report', { path, contentType: 'text/markdown' });
    console.log(`\n[design] ${this.testInfo.title}\n${markdown}\n→ ${path}\n`);
  }

  private record(target: string, rows: ReportRow[]) {
    this.rows.push(...rows);
    const failed = rows.filter((row) => !row.pass);
    expect.soft(failed.length, `${target} — Figma와 다른 값\n${toMarkdown(failed)}`).toBe(0);
  }
}

/** 로컬 dev 오버레이(TanStack Query devtools, Next dev 표시, 개발용 플래그 패널)가 화면 요소를 가리지 않게 숨긴다. */
function hideDevOverlays() {
  const style = document.createElement('style');
  style.textContent =
    '.tsqd-parent-container, nextjs-portal, [data-dev-overlay] { display: none !important; }';
  const inject = () => document.head.appendChild(style);
  if (document.head) inject();
  else document.addEventListener('DOMContentLoaded', inject, { once: true });
}

export const test = base.extend<{
  /** dev 서버의 Flagsmith 값을 덮어쓴다. 예: `test.use({ flagOverrides: { warningEnabled: true } })` */
  flagOverrides: Partial<ClubFeatures>;
  design: DesignChecker;
}>({
  flagOverrides: [{}, { option: true }],
  // 두 번째 인자를 `use`로 부르면 react-hooks 린트가 React 훅으로 오인해서 provide로 부른다.
  context: async ({ context, flagOverrides, baseURL }, provide) => {
    await context.addInitScript(hideDevOverlays);
    if (Object.keys(flagOverrides).length > 0) {
      await context.addCookies([
        {
          name: DEV_FLAG_OVERRIDE_COOKIE,
          value: serializeDevFlagOverrides(toDevFlagOverrides(flagOverrides)),
          url: baseURL ?? 'http://localhost:3000',
        },
      ]);
    }
    await provide(context);
  },
  design: async ({ page }, provide, testInfo) => {
    const checker = new DesignChecker(page, testInfo);
    await provide(checker);
    await checker.attachReport();
  },
});

export { expect };
