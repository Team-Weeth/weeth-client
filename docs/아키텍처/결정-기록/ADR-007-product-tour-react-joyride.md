# ADR-007: 공통 제품 투어(스포트라이트 코치마크) 인프라를 react-joyride v3로 구축

- **status**: accepted
- **date**: 2026-11-02
- **참여자**: @Dahyeon
- **관련**: [[ADR-001-react-compiler]], [[ADR-003-zustand-pattern]], [[../투어-작성-가이드]]

## 맥락

새 기능이 조용히 추가된다. 현재 코드베이스의 유일한 실제 피처 플래그 `warningEnabled`가 켜지면 `PenaltyAddSection`에 "구분(페널티/경고)" 토글이, `MemberTable`에 경고 컬럼이 아무 안내 없이 생긴다. 발견 장치가 없다.

이미 두 개의 bespoke 온보딩이 따로 존재한다 — `HomeTutorialDialog`(embla 캐러셀 모달, localStorage seen 플래그, 역할 게이팅)와 `DuesOnboardingOverlay`(영역 한정 딤 오버레이). 둘 다 특정 UI 요소 하나를 지목하지 못한다. 세 번째 bespoke 오버레이를 만들지, 아니면 "그 UI를 짧게 강조"하는 공통 인프라를 만들지가 갈림길이었다.

`react-joyride`를 채택하려다 보니 숨은 함정이 하나 있었다. **v3.2.0(2026-07)은 API 전면 재작성**인데, 세상의 모든 예제·블로그·모델 기억은 v2 기준이다. 문서 없이 AI에게 구현을 맡기면 컴파일되지 않는 v2 코드를 생성한다. 이 ADR과 `.claude/rules/tour.md`가 존재하는 1차 명분이 이것이다.

## 결정

1. **`react-joyride@3.2.0`을 채택한다.** `useJoyride()` 훅 + 커스텀 `tooltipComponent`를 쓴다. `<Joyride>` 컴포넌트와 v2 prop(`callback`, `styles.options`, `disableOverlayClose` 등)은 쓰지 않는다 — 전체 매핑은 `.claude/rules/tour.md` 참조.
2. **`src/tours/` 피처 폴더 + `data-tour` 레지스트리**로 타깃을 선언한다. `src/constants/tours/`가 아니다 — `write-tests` 스킬이 `src/constants/**`를 "Constants only → 테스트 제외"로 명시하는데, 투어 게이팅 로직(`selectEligibleTour`)은 반드시 단위 테스트해야 한다.
3. **`(main)`과 `admin` 레이아웃 두 곳에 마운트**한다. 공통 조상인 `[clubId]/layout.tsx`에 전역 1회 마운트하지 않는다 — 투어 툴팁은 `document.body`로 포탈되어 `AdminScopeProvider`(`admin/layout.tsx` 아래)의 context를 못 읽으면 어드민 타이포 축소가 적용되지 않는다.
4. **seen 상태는 로컬(`localStorage` 키 `weeth-tour`) + 로그아웃 시 보존 allowlist.** 서버 저장은 후속 과제로 남긴다.
5. **킬스위치 플래그(`club_tour_enabled`)는 두지 않는다.** 각 투어는 자기 기능의 피처 플래그(`requiresFeature`)를 재사용하고, 전면 중단이 필요하면 레지스트리에서 정의를 제거한다.
6. **기존 `HomeTutorialDialog`는 그대로 둔다.** 투어 쪽에서 억제자(suppressor) 패턴으로 공존시킨다.
7. **이번 PR(현재 PR)은 문서 + 스킬만 고정한다.** `src/tours/` 런타임 코드는 다음 PR. 이 ADR의 "결정"은 그 다음 PR이 따라야 할 아키텍처 스펙이기도 하다.

## 이유

- `react-joyride`의 React 19 peer 지원 확인(`react: 16.8 - 19`), Floating UI 기반 포지셔닝, `targetWaitTimeout`이 `MutationObserver` 없이 타깃 폴링/타임아웃/자동 진행을 대체, 내장 포커스 트랩, `'use client'` 경계로 번들을 분리할 수 있다는 점이 결정적이었다.
- `src/flags/club-features/`(definitions.ts + server.ts + `__tests__/`)가 "자기 폴더를 갖는 작은 횡단 서브시스템"의 선례이고, `.claude/rules/feature-flag.md`와 그대로 대응된다 — `src/tours/`도 같은 모양을 따른다.
- 킬스위치를 따로 안 둔 이유: `overlayClickAction: 'close'`(클릭 시 종료), `dismissKeyAction: 'close'`(ESC), 레지스트리에서 정의 제거 + 배포가 이미 탈출구다. 플래그 하나를 추가로 유지하는 비용이 지금 당장의 이득보다 크다고 판단했다. 오버레이가 UI를 막는 사고가 실제로 나면 재검토한다.

## 대안 / 트레이드오프

- **`driver.js`** — 안 골랐다. React 통합이 약하고 커스텀 툴팁이 React 컴포넌트가 아니라 디자인 토큰(cva + 토큰 클래스)을 그대로 재사용하기 어렵다.
- **Radix `Popover` 직접 구현** — 안 골랐다. 스포트라이트 컷아웃, 스크롤 추적, 포커스 트랩을 전부 자작해야 한다.
- **`shepherd.js`** — 안 골랐다. 번들 크기와 테마 커스터마이징 비용이 더 크다.
- **`react-joyride` v2** — 안 골랐다. React 19를 지원하지 않는다.
- **트레이드오프**: v3는 아직 레퍼런스가 거의 없어 AI(및 사람)가 v2 코드를 생성/검색해올 리스크가 실재한다 → `.claude/rules/tour.md`와 `/feature-tour` 스킬로 못 박아 완화한다. 킬스위치를 안 두는 것도 트레이드오프로 명시해 둔다 — 롤백 경로가 "레지스트리에서 지우고 배포"라 즉시성이 떨어진다.

## 영향

- 신규: `src/tours/**`, `src/components/tour/**`, `src/stores/useTourStore.ts`, `src/hooks/tour/useEligibleTour.ts`, `src/lib/analytics.ts`(이 레포의 첫 PostHog 커스텀 이벤트 생산자)
- 변경: `useLogout.ts`의 `localStorage.clear()` → allowlist 방식(`weeth-tour`, `weeth-theme` 보존). 부수적으로 발견: 현재 로그아웃 시 `weeth-theme`도 함께 지워져 사용자가 고른 라이트/다크 설정이 매번 `auto`로 초기화되는 기존 버그가 있다 — 이 변경이 같이 고친다.
- 변경: `(main)/layout.tsx`, `admin/layout.tsx`에 `TourMount` 추가, `getClubFeatures(clubId)` 호출을 `Promise.all`로 병렬화
- 변경: `HomeTutorialLauncher.tsx`에 억제자 등록/해제 추가
- `globals.css`에 토큰 1개 추가 예정 (`--tour-tooltip-width`, 사용자 확인 후)
- `.claude/rules/*` 6개 파일에 투어 관련 절 추가 (`architecture.md`, `design-tokens.md`, `state-management.md`, `testing.md`, `feature-flag.md`, 그리고 신규 `tour.md`)

## 백엔드에 남은 요청

현재 없음 (로컬 저장만 구현). 서버 저장으로 전환할 때 필요한 엔드포인트:

- `GET /clubs/{clubId}/members/me/tours` → `{ data: { [tourId]: number } }`
- `PUT /clubs/{clubId}/members/me/tours/{tourId}` body `{ version }`
