# react-joyride v3 + Next.js 투어 구현 함정

## 증상

`react-joyride`로 투어를 구현하는데 아래 중 하나가 발생한다.

- `import Joyride from 'react-joyride'`가 타입 에러 또는 런타임에 `undefined`
- `styles.options`로 넘긴 값(zIndex 등)이 아무 효과가 없음
- `spotlightClicks`를 꺼도 타깃 클릭이 막히지 않음 (또는 반대)
- `run` prop을 안 줬는데 투어가 시작되지 않음
- 첫 스텝의 타깃이 화면 밖에 있는데 스크롤되지 않음
- `portalElement`를 지정했는데 아무것도 렌더되지 않고 에러도 없음
- 포탈된 툴팁 안에서 어드민 타이포 스케일(`[data-admin]`)이 적용되지 않음
- Radix `Dialog`/`Sheet`가 열려 있을 때 그 아래 스포트라이트가 안 보이고 클릭도 안 됨
- Jest 테스트에서 투어 컴포넌트가 위치를 못 잡고 깨짐

## 원인

**`react-joyride` 3.2.0(2026-07)은 API 전면 재작성이다.** 인터넷의 거의 모든 예제·블로그·Stack Overflow 답변, 그리고 LLM의 기억은 v2 기준이라 그대로 베끼면 동작하지 않는다.

| v2 | v3.2.0 |
| --- | --- |
| `import Joyride from 'react-joyride'` (default export) | default export 없음. `import { Joyride, useJoyride } from 'react-joyride'` |
| `callback` prop | `onEvent?: EventHandler` |
| `styles.options.zIndex` | `styles.options` 삭제 → 최상위 `options?: Partial<Options>` |
| `disableOverlayClose` | `overlayClickAction: 'close' \| 'next' \| 'replay' \| false` |
| `spotlightClicks` | `blockTargetInteraction` — **의미가 반전됨** |
| `run` 기본값 `true` | 기본값 `false` |
| `scrollToFirstStep` — v2에선 문제 안 됨 | 기본값 `false` — 명시적으로 `true` 설정 필요 |

나머지 증상들의 개별 원인:

- **`portalElement`를 넘기면 조용히 실패한다.** 오버레이가 문서 기준이 아니라 지정한 엘리먼트 기준으로 크기를 잡는데, 셀렉터가 안 맞으면 `usePortalElement`가 `null`을 반환해 아무것도 렌더하지 않는다. 에러 없이 조용히.
- **포탈된 UI는 `[data-admin]` 밖이다.** 투어 툴팁은 `document.body`에 포탈된다. 어드민 레이아웃의 타이포 축소는 `[data-admin]` 조상에 의존하는데, 포탈된 노드는 DOM 트리에서 그 밖에 있다. React context(여기서는 `AdminScopeProvider`)는 포탈을 통과하므로, `AdminScopeBoundary`로 감싸야 한다 — `Tooltip`, `dialog`, `popover`, `Sheet`, `DropdownMenu`, `CalendarPicker`, `alert-dialog`가 이미 이렇게 한다.
- **Radix의 `pointer-events: none`이 스포트라이트를 죽인다.** Radix `Dialog`/`Sheet`/`Popover`가 열리면 `<body>`에 `pointer-events: none`을 걸고 형제 엘리먼트에 `aria-hidden`을 건다. 그 아래 깔린 투어 스포트라이트는 보조기술에 안 보이고 클릭도 안 된다.
- **`jsdom`에는 레이아웃 엔진이 없다.** `getBoundingClientRect()`가 항상 0을 반환하므로 실제 `Joyride`/`useJoyride`는 위치도 스포트라이트 모양도 계산할 수 없다. 테스트에서는 반드시 목(mock)으로 교체한다.

## 해결

- v2 레퍼런스를 참고하지 않는다. `.claude/rules/tour.md`의 Version Pin 표를 1차 소스로 쓴다.
- `useJoyride()` 훅만 쓴다 (`<Joyride>` 컴포넌트는 쓰지 않음). `TourRunner.tsx` 한 곳에서만 런타임 import.
- `portalElement`는 절대 넘기지 않는다.
- 투어 전용 UI(`TourTooltip`)는 `AdminScopeBoundary`로 감싼다.
- 투어 정의 규칙으로 "Radix Dialog/Sheet/Popover 내부를 타깃으로 삼지 않는다"를 강제하고, 모달이 열려 있는 동안은 억제자(suppressor)로 투어 자체를 보류한다.
- Jest에서는 `jest.mock('react-joyride', ...)`로 `useJoyride`를 이벤트 레지스트리 + `controls.start` 스파이를 노출하는 페이크로 교체한다.

## 참고

- `.claude/rules/tour.md` — Version Pin 표, Hard Rules, Token Bridge
- [[../아키텍처/결정-기록/ADR-007-product-tour-react-joyride]]
- [[e2e-snapshot-os-mismatch]] — 비주얼 스냅샷을 안 쓰는 이유도 같은 "환경별 렌더 차이" 계열 문제
