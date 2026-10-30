---
name: figma-verify
description: "Figma 디자인과 구현된 화면을 실제 브라우저 측정값으로 대조한다. Figma URL(노드)과 화면 경로가 있을 때, '피그마랑 맞는지', '디자인 차이', 'UI 검증' 요청이나 UI 수정 후 보고 전에 사용한다."
argument-hint: '<figma-url> <route> [상태 설명]'
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, mcp__figma__get_metadata, mcp__figma__get_variable_defs, mcp__figma__get_screenshot, mcp__figma__get_design_context
---

# Figma Verify

Figma 값을 기대값으로 적은 Playwright 스펙(`e2e/design/*.spec.ts`)을 돌려 레이아웃 박스와
computed style을 숫자로 비교한다. **화면을 보지 않고 수치를 추정해 고치거나 "맞다"고 보고하지 않는다.**

`/figma-to-component`(구현)와 짝을 이룬다. 구현이 끝나면 이 스킬로 검증하고, 통과한 스펙은 회귀 방지용으로 남긴다.

## 0. 전제

- dev 서버 `http://localhost:3000`이 떠 있어야 한다 (`pnpm dev`). 화면이 로컬 API(`NEXT_PUBLIC_API_URL`)를 부르면 백엔드도 필요하다.
- `.env.local`에 유효한 `DEV_ACCESS_TOKEN`이 필요하다. `e2e/setup/auth.ts`가 쿠키로 넣는다.
- 플래그로 갈리는 화면은 `test.use({ flagOverrides: { <flag>: true } })`로 강제한다. dev 서버(`NODE_ENV=development`)에서만 동작한다.

## 1. Figma 값 수집 — 싼 호출부터

1. **`get_metadata`를 화면 프레임에** 호출한다. 프레임 크기는 viewport로, 자식의 x/y/width/height는 위치·패딩·간격으로 쓴다.
   - 섹션 단위로 부르면 결과가 파일로 저장된다. 필요한 노드의 서브트리와 부모 체인만 스크립트로 뽑아 읽는다.
2. **`get_variable_defs`를 최상위 컴포넌트 프레임**(Modal, Sheet 등)에 호출한다. 색·타이포·radius·그림자를 얻는다.
   - 하위 노드에 부르면 프레임의 stroke/effect가 빠진다. 스크린샷 가장자리를 테두리로 착각하기 쉬우니 effect 값으로 확인한다.
3. 채우기 색처럼 위 두 호출로 알 수 없는 값만 `get_design_context`로 확인한다.

### 변환 규칙

| Figma | 스펙 |
| --- | --- |
| 화면 프레임 W×H | `test.use({ viewport: { width: W, height: H } })` |
| `DROP_SHADOW offset(x, y) radius r spread s color #RRGGBBAA` | `boxShadow: [{ x, y, blur: r, spread: s, color: '#RRGGBBAA' }]` |
| stroke 없음 | `borderWidth: 0` |
| `Font(size, weight, lineHeight)` | `fontSize`, `fontWeight`, `lineHeight` |
| `letterSpacing: -0.5` | **퍼센트**다. px = size × (-0.5 / 100). 코드 토큰은 `-0.005em` |
| auto layout padding / gap | `paddingTop…`, `rowGap`/`columnGap` |
| 다른 부모에 속한 두 요소 사이 거리 | `design.spacing(from, to, { vertical })` |
| 화면 프레임 기준 x/y (고정 위치 요소) | `offsetRight = 프레임W − (x + w)`, `offsetBottom = 프레임H − (y + h)` |
| 여러 줄 텍스트 박스 | 너비 대신 `lines`(줄 수)로 비교한다. DOM 텍스트는 내용에 맞춰 줄어든다 |

### 알려진 의도적 차이

차이가 나면 `src/app/globals.css` 토큰부터 확인한다. 토큰이 의도적으로 Figma와 다르면 스펙에 코드 값을 적고, 이유를 주석으로 남긴다.

| 항목 | Figma | 코드 | 근거 |
| --- | --- | --- | --- |
| Body1 font-weight | 400 (Regular) | 470 | `--body1-weight` |

## 2. 스펙 작성

`e2e/design/<feature>.spec.ts`에 작성한다. 맨 위 주석에 Figma 노드 id를 적는다.

```ts
import { resolveClubId } from '../helpers';
import { test } from './design-helpers';

// Figma: <페이지> > <프레임>(노드 id, W×H)
test.describe('<화면> — 데스크톱', () => {
  test.use({ viewport: { width: 1280, height: 1080 }, flagOverrides: { someFlagEnabled: true } });

  let clubId: string;
  test.beforeAll(async ({ browser }) => {
    test.setTimeout(60_000);
    const context = await browser.newContext({ storageState: 'e2e/.auth/user.json' });
    try {
      clubId = await resolveClubId(await context.newPage());
    } finally {
      await context.close();
    }
  });

  test('<영역>', async ({ page, design }) => {
    await page.goto(`/${clubId}/home`);
    const panel = page.getByRole('dialog', { name: '...' });
    await design.check('패널', panel, { width: 410, borderRadius: 16, boxShadow: [{ x: 0, y: 10, blur: 30, color: '#1121314D' }] });
    await design.spacing('제목 → 본문', title, body, { vertical: 8 });
    await design.screenshot('panel', panel);
  });
});
```

- `design.check(이름, locator, spec)`: 지정한 속성만 비교한다. 길이 허용 오차는 기본 1px이다. 색은 hex·rgb()·`var(--token)` 모두 받는다.
- Locator 우선순위는 role → label → text다 (`TESTING.md` 8-3). 구조 선택자는 최후 수단으로만 쓴다.
- 모바일 프레임이면 `FIGMA_VIEWPORTS.mobile`처럼 `isMobile`·`hasTouch`도 함께 준다.

## 3. 실행

```bash
pnpm test:e2e:design e2e/design/<feature>.spec.ts
```

- 불일치는 `| 대상 | 속성 | Figma | 실제 | ❌ |` 표로 출력된다.
- 전체 비교표는 `test-results/**/design-report.md`, 스크린샷은 같은 폴더의 `*.png`에 남는다.

## 4. ❌ 처리 — 하나씩 원인을 분류한다

| 분류 | 조치 |
| --- | --- |
| 구현 버그 | 코드를 고치고 다시 실행한다 |
| 스펙 오류 (Figma 해석 실수) | 스펙을 고치고, 근거(노드·변수 값)를 주석으로 남긴다 |
| 디자인 결정 필요 (의도적 차이일 수 있음) | **고치지 말고 사용자에게 묻는다.** 예: Figma와 기존 화면 요소의 위치가 다를 때 |

자주 나오는 원인:

- **lineHeight ❌**: 공용 컴포넌트의 기본 클래스(`DialogTitle`의 `leading-none` 등)가 `typo-*`를 덮는다. `cn()`(tailwind-merge)은 커스텀 `typo-*` 유틸과의 충돌을 모른다.
- **margin이 예상보다 큼**: margin 유틸(`m*`)은 spacing이 아니라 Figma margin 이름을 따른 `--margin-*` 스케일을 쓴다. `gap-600`은 24px이지만 `mt-600`은 40px이고, 24px margin은 `mt-400`이다.
- **바텀시트 높이 ❌**: vaul 시트는 요소 높이가 화면 전체이고 transform으로 내려간다. 높이 대신 `offsetTop`과 하단 요소의 `offsetBottom`으로 확인한다.
- **strict mode violation**: 스크린리더용 `sr-only` 제목과 화면 제목이 함께 있는 경우다. Playwright는 1px짜리 `sr-only`도 visible로 보므로 `visible` 필터로는 안 되고, 화면 쪽 요소(`aria-hidden` 등)로 좁힌다.
- **dev 서버에서 입력이 반영되지 않음**: 하이드레이션 전에 `fill`했기 때문이다. `expect(...).toPass()` 안에서 `fill('')`로 비운 뒤 다시 입력한다. 같은 값을 다시 넣으면 React가 변경으로 보지 않는다.
- **색 ❌가 1~2 단위**: 허용 오차 안이면 통과한다. 그보다 크면 토큰이 잘못 연결된 것이다.
- **borderRadius가 비정상적으로 큼**: 측정기가 짧은 변의 절반으로 자르므로 `rounded-full`은 지름의 절반으로 비교한다.
- **측정값이 흔들림**: 애니메이션 중이다. 헬퍼가 박스가 멈출 때까지 기다리고 `reducedMotion`도 켜져 있다. 그래도 흔들리면 열림 애니메이션이 끝나는 조건을 스펙에서 기다린다.

수치로 잡히지 않는 것(아이콘 모양, 정렬, 잘림)은 스크린샷을 Read로 열어 `get_screenshot`과 비교한다.
사용자가 본 화면이 측정 결과와 다르면 브라우저 캐시를 의심한다 (Safari 강력 새로고침은 ⌥⌘R).

## 5. 보고

- 남은 ❌ 표와 각 행의 분류, 스크린샷 경로를 보고한다.
- 모든 행이 ✅이거나, 남은 ❌가 사용자가 확인한 의도적 차이일 때만 "Figma와 일치"라고 말한다.
- 통과한 스펙은 해당 기능 PR에 함께 넣어 회귀 방지에 쓴다. 디자인 스펙은 dev 서버와 계정 데이터가 필요해 CI에서는 돌지 않는다.
