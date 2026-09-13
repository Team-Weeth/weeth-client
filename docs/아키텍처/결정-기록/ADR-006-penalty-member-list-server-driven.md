# ADR-006: 페널티 멤버 리스트를 전체 fetch에서 서버 주도로 전환

- **status**: accepted
- **date**: 2026-09-09
- **참여자**: @JIN921
- **관련**: [[ADR-005-admin-shared-components]], [[ADR-002-data-fetching-strategy]]

## 맥락

어드민 페널티 페이지의 멤버 리스트는 처음에 이렇게 동작했다.

- `useAdminPenaltyMembers(cardinalNumber)` 가 `GET /admin/clubs/{clubId}/members` 를 `hasNext` 가 끝날 때까지 페이지네이션 루프로 돌려 **선택한 기수의 멤버 전체**를 받아옴 (`size=100` 씩)
- 검색(`searchPenaltyMembers`), 정렬(`sortPenaltyMembers`), 표 페이지네이션(`useTableSelection` 내부 `slice`)을 **모두 클라이언트**에서 처리

이 구조를 택한 이유는 정렬 기준 3개 중 2개(`penalty` = 페널티 횟수순, `recent` = 최근 페널티일순)를 **멤버 목록 API가 지원하지 않기** 때문이었다. 클라에서 정렬하려면 전체 데이터셋이 필요하고, 전체가 이미 메모리에 있으니 검색·페이징도 클라에서 하는 게 일관됐다.

이번에 스웨거를 다시 보니 `GET /admin/clubs/{clubId}/members` 가 이미 `keyword`(이름·학과·학번), `cardinalNumber`, `sort`, `page`, `size` 를 전부 받는다. `sort` 지원 값은 `CARDINAL_DESC` / `CARDINAL_ASC` / `NAME_ASC` / `JOINED_DESC` — 여전히 페널티 기준은 없다. 별도 `GET /members/search` 도 있으나 `PageResponse` 가 아니라 평탄한 배열이고 `sort`·`page` 를 안 받아 목록 경로와 통일할 수 없다.

전체 fetch 루프는 기수 인원이 늘수록 선형으로 느려지고(요청 N번 + 전량 매핑), React Query 캐시 이점도 약하다. 정렬 2종을 포기할 수 있다면 루프를 없앨 수 있다.

## 결정

### 1. 페널티 횟수·최근일 정렬을 제거하고 기수 정렬만 남긴다

- `PenaltySortBy`: `'cardinal' | 'penalty' | 'recent'` → `'CARDINAL_DESC' | 'CARDINAL_ASC'` (버튼은 기수 높은 순 ↔ 낮은 순 토글)
- `types/admin/penalty.ts` 와 `constants/admin/penaltyTable.constants.ts` 에 `TODO(페널티 정렬)` 주석을 달아 **"왜 빠졌는지 + 되살리는 조건"**을 코드에 남김
- 되살리는 조건: 백엔드가 `/members` 의 `sort` 에 `PENALTY_COUNT_DESC/ASC`, `LAST_PENALTY_AT_DESC/ASC` (네이밍은 서버 컨벤션) 를 추가하면 order/label에 다시 넣는다

> 페널티 횟수순은 "누가 제일 많이 쌓였나"라 관리 화면에서 유용하다. 순수 기술 편의로 지운 게 아니라, 백엔드 지원 없이는 전체 fetch를 강제하기 때문에 **잠정 제거**한 것이다.

### 2. 멤버 리스트는 `/members` 하나로 서버 검색·정렬·페이지네이션한다

- `useAdminPenaltyMembers({ cardinalNumber, keyword, sort, page })` — 서버가 필터·정렬한 한 페이지(`size=8`)만 조회. fetch 루프 삭제
- `GET /members/search` 는 **쓰지 않는다.** `keyword` 는 `/members` 에 이미 있고, `/search` 를 끼우면 페이징·정렬이 클라로 돌아와 경로가 갈라진다
- 검색어는 `useDebouncedValue`(신규, 300ms)로 완충 후 `keyword` 로 전달
- 기수·정렬·검색어가 바뀌면 페이지를 1로 리셋 (`MemberPageContent` 의 clamp 패턴과 동일하게 `useEffect`)

### 3. 선택 멤버는 `id → PenaltyMember` 맵으로 별도 보관한다

전체 목록이 클라에 없어졌으므로, 선택한 멤버 칩(`PenaltyMemberSearchInput`)과 제출 페이로드를 이전처럼 "전체 목록에서 `filter`"로 만들 수 없다.

- `PenaltyPageContent` 에 `selectedMemberMap: Map<string, PenaltyMember>` 상태를 두고, 선택이 바뀔 때마다 현재 페이지(`visibleMembers`)에서 새 id를 채워 넣고 해제된 id는 뺀다 (`member/hooks/useMemberSelection` 과 같은 접근)
- `draft.memberIds`(string[])는 그대로 선택의 단일 출처. 칩은 `memberIds.map(id => map.get(id))` 로 해석
- 기수 변경·기록 제출 성공 시 맵도 함께 비운다

### 4. `useTableSelection` 에서 내부 페이지네이션을 제거한다

[[ADR-005-admin-shared-components]] 의 "미해결 중복 A"에서 예고한 방향이다. 이 훅은 `PenaltyTable` 만 쓰므로 안전하게 바꿀 수 있었다.

- `items`(= 현재 페이지), `selectedIds`, `onSelectionChange` 만 받아 `isAllSelected` / `toggleAll` / `toggleOne` 계산만 담당
- `perPage` / `currentItems` / `currentPage` / `totalPages` / `onPageChange` 제거
- `PenaltyTable` 은 `page` / `totalPages` / `onPageChange` 를 props로 받아 `TablePagination` 에 그대로 넘김 (멤버 표와 같은 "페이지네이션은 부모" 구조로 수렴)

## 이유

- 전체 fetch 루프는 기수 인원에 선형이고, "일부만 받으면 조용히 누락"이라는 주석 자체가 위험 신호였다. 서버가 이미 검색·정렬·페이징을 다 해줄 수 있는데 클라가 전량을 들고 도는 건 낭비다.
- 정렬 2종 제거는 손실이지만, 그 2종 때문에 **all-or-nothing** 이었다 — 하나라도 클라 정렬로 남기면 전체 fetch를 못 버린다. 백엔드 지원이 생기면 서버 정렬로 깔끔히 복원되므로, 클라 정렬 코드를 유지하는 것보다 낫다.
- `useTableSelection` 단순화는 ADR-005가 이미 "다음에 할 때"로 지정해둔 작업이라, 페널티 쪽을 건드리는 김에 정리했다.

## 대안 / 트레이드오프

- **`/members/search` 를 검색 전용으로 사용** — 안 골랐다. `PageResponse` 가 아니고 `sort`·`page` 미지원이라, 검색 시에만 페이징·정렬이 클라로 돌아가 "검색 중 / 평소" 두 코드 경로가 생긴다.
- **정렬 2종을 유지하고 전체 fetch도 유지** — 안 골랐다. 인원 증가에 취약하고, 애초에 이 전환의 동기다.
- **`useInfiniteQuery` 무한 스크롤** — 안 골랐다. 페널티 표는 이미 `TablePagination`(번호 페이저)을 쓰고 있어 번호 페이징을 유지하는 게 변경 최소다. (모바일 대응이 필요해지면 `MemberPageContent` 처럼 뷰포트별 분기)
- **트레이드오프** — 로딩 중 `placeholderData` 로 이전 페이지를 유지하되 테이블을 흐리게 처리한다. 검색어 입력 → 디바운스 → 리페치 사이 짧은 지연이 생긴다(클라 즉시 필터 대비 체감 저하). 300ms로 타협.

## 영향

- `hooks/useDebouncedValue.ts` 신규
- `useAdminPenaltyMembers` 시그니처 변경(위치 인자 → 객체), 반환 `{ members, totalPages }` 로 변경
- `adminQueryKeys.penaltyMembers` 에 `{ keyword, sort, page }` 파라미터 추가 → 캐시가 파라미터별로 분리됨
- `PENALTY_MEMBER_PAGE_SIZE`(100) 상수 삭제, `PENALTY_MEMBERS_PER_PAGE`(8)가 서버 `size` 로 겸용
- `penaltyPageUtils` 에서 `searchPenaltyMembers` / `sortPenaltyMembers` 삭제 (`getNextPenaltySort` 는 2개 토글로 유지)
- `useTableSelection` API 축소 — 현재 `PenaltyTable` 만 사용하므로 외부 영향 없음. ADR-005 "미해결 중복 A"의 멤버 표 이관은 여전히 남아 있음
- 테스트: `penaltyPageUtils.test.ts`(검색·정렬 블록 제거), `PenaltyTable.test.tsx`(props에 `page`/`totalPages`/`onPageChange` 추가, 클라 페이지네이션 케이스 → 서버 페이지네이션 케이스로 교체)

## 백엔드에 남은 요청

1. `/members` 의 `sort` 에 페널티 정렬 값 추가 (`PENALTY_COUNT_*`, `LAST_PENALTY_AT_*`)
2. `/members?keyword=` 가 정상 동작하는지 확인 → 맞으면 `/members/search` 는 프론트에서 미사용 (제거하거나 최소한 `PageResponse` + `sort`/`page` 지원으로 통일)
