# ADR-005: 어드민 공용 컴포넌트 승격 기준과 미해결 중복 2건

- **status**: accepted
- **date**: 2026-09-06
- **참여자**: @JIN921
- **관련**: [[ADR-001-react-compiler]], [[../폴더-구조]], [[../도메인-용어집]]

## 맥락

`WTH-467 어드민 페널티 UI` 작업에서 페널티 페이지를 만들 때 기존 멤버 페이지 코드를 복사해 시작했다. 그 결과 PR 리뷰 시점에 다음이 발견됐다.

- `getLatestCardinalNumber` — `memberPageUtils`와 `penaltyPageUtils`에 글자 단위로 동일한 함수 2벌
- `CardinalTag` — `MemberCard` / `MemberTableRow` / `PenaltyCardinalTag`에 3벌
- 날짜 포맷 — `formatJoinedAt`이 기존 `formatCompactDateDisplay`와 출력 동일
- 표 텍스트 셀, 기수 필터 한 줄, 정렬 comparator 등 소규모 중복 다수

멤버 다음으로 페널티가 두 번째 "표 + 선택 + 페이지네이션" 어드민 페이지였기 때문에, **무엇이 도메인 고유이고 무엇이 어드민 공용인지** 처음으로 드러난 시점이었다.

## 결정

### 1. 어드민 공용 컴포넌트는 `components/admin/` 직하에 둔다

두 개 이상의 어드민 도메인(`member/`, `penalty/`, `schedule/`, `dues/` …)에서 쓰이는 컴포넌트는 도메인 폴더에서 꺼내 `components/admin/` 직하로 옮기고, 도메인 접두사를 이름에서 뗀다.

| 이전 | 이후 |
| --- | --- |
| `member/MemberSelectionCheckbox` | `admin/SelectionCheckbox` |
| `member/MemberPagination` | `admin/TablePagination` |
| `member/MemberTableRow` 내부 `MemberTextCell` | `admin/TableTextCell` |
| `MemberCard`·`MemberTableRow`·`PenaltyCardinalTag`의 `CardinalTag` | `admin/CardinalTag` + `admin/CardinalTagList` |

기존 `FloatingSelectionBar` / `SelectedCountLabel`이 이미 이 위치에 있어 선례를 따랐다.

### 2. 기수(Cardinal) 파싱·정렬 로직의 단일 출처는 `utils/admin/memberTableUtils.ts`

`getCardinalNumber` / `getLatestCardinalNumber` / `compareCardinalDesc` / `compareLatestCardinalDesc` / `hasCardinal` / `getVisibleMemberCardinals` / `formatCardinalLabel`을 모두 이 파일에 모았다. `memberPageUtils`·`penaltyPageUtils`는 여기서 import만 한다.

> 이름이 `member`로 시작하지만 어드민 전역에서 쓰인다. 파일명 변경은 diff가 커져 이번엔 보류했다.

### 3. 날짜 포맷의 단일 출처는 `utils/shared/date.ts`

도메인 유틸에서 `dateStr.split('-')`로 직접 포맷하지 않는다. `formatDateDisplay`(`2026. 07. 18`) / `formatCompactDateDisplay`(`2026.07.18`)에 위임하고, 도메인 고유 처리(후행 점, `null → '-'`)만 감싼다.

### 4. `components/admin/` 내부에서는 `@/components/admin` 배럴을 import 하지 않는다

배럴은 `AttendancePageContent` → `@/hooks` → `useCodeHighlight`(ESM)로 이어져 **Jest가 transform하지 못한다.** 실제로 `PenaltyCardinalTabs`가 배럴을 쓰는 바람에 페널티 테스트 4개 스위트가 깨졌다.

```ts
// Bad — admin 폴더 내부에서 자기 배럴을 참조
import { CardinalCard } from '@/components/admin';
import { useDragScroll } from '@/hooks';

// Good — 직접 경로
import { CardinalCard } from '@/components/admin/member/CardinalCard';
import { useDragScroll } from '@/hooks/useDragScroll';
```

배럴은 **`components/admin/` 바깥에서 들어올 때만** 쓴다. `.claude/rules/data-fetching.md`의 `lib/apis` 배럴 주의사항과 같은 성격의 문제다.

> **2026-09-06 갱신** — `develop`이 [[ADR-004-openapi-typescript]]와 별개로 진행한 빌드 최적화(WTH-469)에서 `@/components/ui` 배럴 import를 전면 제거했다(직접 경로 110파일 : 배럴 3파일). 이제 UI 컴포넌트도 `@/components/ui/table`, `@/components/ui/Button`처럼 **직접 경로**로 가져오고, 아이콘 역시 `@/assets/icons/admin/ic_admin_meatball.svg`처럼 직접 import한다. 이 규칙은 `components/admin/` 안팎을 가리지 않는다.

## 미해결 중복 2건 (의도적 보류)

아래 두 건은 이번 PR에서 **고치지 않기로 했다.** 나중에 "왜 안 고쳤지?"가 나오지 않도록 이유를 남긴다.

### A. 선택 토글 로직 3중 복제

`isAllSelected` / `hasAnySelected` / `isPartiallySelected` / `toggleAll` / `toggleOne`이 세 곳에 글자 단위로 동일하게 존재한다.

- `hooks/admin/useTableSelection.ts` (이번 PR에서 신규 추출, `PenaltyTable`만 사용)
- `components/admin/member/MemberTable.tsx`
- `components/admin/member/MemberCardList.tsx`

**보류 이유** — 단순 치환이 아니다. 멤버 쪽은 페이지네이션이 부모(`MemberPageContent`)에 있어 이미 잘린 `members` 배열과 `page`/`totalPages`를 props로 받는 반면, `useTableSelection`은 전체 목록을 받아 자체적으로 `slice`한다. 이관하려면 훅에 "외부 페이지네이션" 모드를 추가하거나 부모 상태를 훅으로 끌어와야 하고, 멤버 표는 벌크 액션(기수 변경·강퇴)이 선택 상태에 물려 있어 회귀 위험이 있다.

**다음에 할 때** — `useTableSelection`에 `items`를 "이미 페이지네이션된 목록"으로도 받을 수 있는 옵션을 추가한 뒤 `MemberTable` → `MemberCardList` 순으로 이관. 멤버 벌크 액션 E2E 확인 필수.

### B. 기수 태그 루프 2곳 잔존

`visibleCardinals.map(...)` + `+N` 렌더 패턴이 `CardinalTagList`로 3곳은 통합됐으나 두 곳이 남았다.

- `penalty/modal/PenaltyDetailModal.tsx` — `ScheduleTag` 사용
- `member/modal/MemberDetailSections.tsx` — `MemberDetailCardinalTag` + 자체 툴팁 사용

**보류 이유** — 루프 로직은 같지만 렌더하는 태그 컴포넌트가 셋 다 다르다. 통합하려면 `CardinalTagList`에 `renderTag` prop이나 `asChild`를 넣어 태그를 주입 가능하게 만들어야 하는데, 호출부가 2곳뿐이라 추상화 비용이 이득보다 크다고 판단했다.

**다음에 할 때** — 세 번째 호출부가 생기면 그때 주입 메커니즘을 넣는다. 그 전까지는 중복을 허용한다.

## 이유

- 어드민 페이지는 앞으로도 계속 늘어난다(출석·회비·게시판·세션…). 두 번째 페이지에서 정리해두지 않으면 세 번째·네 번째 사본이 생긴다. 실제로 `CardinalTag`는 이미 3벌까지 늘어난 상태였다.
- 반대로 **호출부 2곳짜리 중복을 억지로 추상화하면** 주입 prop과 분기가 늘어 오히려 읽기 어려워진다. "세 번째 사본이 생기면 그때 뽑는다"를 기준선으로 삼았다.

## 대안 / 트레이드오프

- **공용 컴포넌트를 `components/ui/`에 두기** — 안 골랐다. `SelectionCheckbox`·`TablePagination`은 어드민 표 레이아웃에 종속적이라 범용 UI가 아니다.
- **도메인 폴더에 두고 서로 딥 임포트** — 안 골랐다. `@/components/admin/member/MemberPagination` 같은 경로는 소유권을 오해하게 만들고 `.claude/rules/architecture.md`의 배럴 규칙에 어긋난다.
- **이번 트레이드오프** — `memberTableUtils.ts`라는 이름이 어드민 전역 기수 유틸의 단일 출처가 되어 이름과 실제 범위가 어긋난다. 이름 변경은 diff 규모 때문에 미뤘고, 이 ADR이 그 간극을 메운다.

## 영향

- `components/admin/`에 신규: `CardinalTag`, `CardinalTagList`, `SelectionCheckbox`, `TablePagination`, `TableTextCell` (모두 `admin/index.ts`에 export)
- `utils/admin/memberTableUtils.ts`가 기수 유틸 단일 출처
- `penalty/index.ts` 배럴이 실제 사용 컴포넌트를 export하도록 정정
- 후속 작업 2건은 위 "미해결 중복" 참조
