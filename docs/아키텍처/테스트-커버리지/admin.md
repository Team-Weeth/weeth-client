# Test Coverage — Admin Domain

Records unit/integration test coverage for files under `src/components/admin/` and `src/utils/admin/`.

---

## 세션 일정 목록 (`src/components/admin/schedule/general/`)

**Measured**: 2026-11-16
**Test files**:
- `src/utils/admin/__tests__/sessionScheduleListUtils.test.ts`
- `src/components/admin/schedule/general/__tests__/SessionScheduleList.test.tsx`
- `src/components/admin/schedule/general/__tests__/ScheduleOverviewContent.integration.test.tsx`

**Total tests**: 25

### Coverage by file

| File | Statements | Branches | Functions | Lines |
|------|-----------|---------|---------|-------|
| `sessionScheduleListUtils.ts` | 100% | 100% | 100% | 100% |
| `SessionScheduleList.tsx` | 100% | 95.23% | 100% | 100% |
| `ScheduleOverviewContent.tsx` | 88.65% | 70.27% | 33.33% | 88.65% |

### Test composition

#### `sessionScheduleListUtils.test.ts` (10 tests)

날짜 포맷 순수 함수 단위 테스트.

| Case | What is verified |
|------|-----------------|
| formatGroupDateRange — end null | 시작일만 표시 |
| formatGroupDateRange — end 있음 | 범위 표시 (`~` 포함) |
| formatTimeRange | ISO 문자열에서 `HH:MM - HH:MM` 추출 |
| formatSessionDate | 날짜 + 요일 (월~일) 포함 형식 |
| isRepeating — null/NONE | false 반환 |
| isRepeating — DAILY/WEEKLY/MONTHLY | true 반환 |

#### `SessionScheduleList.test.tsx` (8 tests)

펼치기/접기, 검색, 콜백 호출 검증.

| Case | What is verified |
|------|-----------------|
| 빈 목록 | 빈 상태 메시지 렌더링 |
| 테이블 헤더 | 세션 제목·날짜·반복·진행·상태·출석 관리 헤더 존재 |
| 그룹 제목 렌더링 | 반복/단일 그룹 제목 표시 |
| 토글 | 회차 접기/펼치기 버튼 클릭 |
| 검색 필터링 | 검색어 일치/불일치 필터 |
| 빈 검색 결과 | 빈 상태 메시지 |
| onEditGroup 콜백 | 수정 버튼 클릭 |

#### `ScheduleOverviewContent.integration.test.tsx` (8 tests)

탭 전환·검색·생성 버튼 텍스트 변경 통합 검증.

| Case | What is verified |
|------|-----------------|
| 기본 렌더링 | 필터 칩과 일정 목록 존재 |
| 세션 탭 전환 | 세션 목록 표시 |
| 세션 안내 배너 | 출석 연결 안내 문구 |
| 검색 (제목) | 제목 기반 필터링 |
| 검색 (위치) | 위치 기반 필터링 |
| 생성 버튼 — 일반 탭 | "일정 생성" 텍스트 |
| 생성 버튼 — 세션 탭 | "세션 생성" 텍스트 |
| 필터 칩 개수 | EVENT/SESSION 개수 표시 |

### Uncovered branches

| File | Lines | Reason |
|------|-------|--------|
| `ScheduleOverviewContent.tsx` | 107–124, 258–284 | EditScheduleModal/EditSessionModal 열기 흐름 — 모달 조합 테스트로 별도 커버 필요 |
| `ScheduleOverviewContent.tsx` | 224, 235 | 로딩/에러 상태 — API 직접 모킹 통합 테스트 추가 시 커버 가능 |

---

## 세션 수정 모달 (`src/components/admin/schedule/modal/`)

**Measured**: 2026-11-28 (`EditSessionModalContent.tsx` 재측정)
**Test files**:
- `src/components/admin/schedule/modal/__tests__/CreateSessionScheduleForm.test.tsx`
- `src/components/admin/schedule/modal/__tests__/EditSessionModalContent.test.tsx`

**Total tests**: 15

### Coverage by file

| File | Statements | Branches | Functions | Lines |
|------|-----------|---------|---------|-------|
| `CreateSessionScheduleForm.tsx` | 95.34% | 80.76% | 100% | 95.34% |
| `EditSessionModalContent.tsx` | 91.6% | 80.76% | 60% | 91.6% |

### Test composition

#### `CreateSessionScheduleForm.test.tsx` (6 tests)

폼 유효성 검사, 제출 로직, 반복 설정 포함 제출 검증.

| Case | What is verified |
|------|-----------------|
| 버튼 렌더링 | 취소/저장 버튼 존재 |
| 초기 비활성화 | 저장 버튼 비활성 |
| 취소 클릭 | onClose 호출 |
| 유효한 폼 제출 | onCreateSession 호출 및 body 구조 검증 |
| 반복 설정 제출 | recurrenceType/recurrenceEndDate 포함 |
| cardinals 전달 | SessionScheduleForm props 검증 |

#### `EditSessionModalContent.test.tsx` (9 tests)

단건/반복 세션 저장·삭제 분기, 변경 감지, 닫기 흐름 검증.

| Case | What is verified |
|------|-----------------|
| 헤더 렌더링 | "세션 수정" 텍스트, 저장/취소 버튼 |
| 기존 제목 표시 | 초기 form 값 반영 |
| 변경 없이 취소 | onClose 즉시 호출 |
| 변경 없이 닫기 | onClose 즉시 호출 |
| 비반복 저장 | THIS_ONLY scope로 submitUpdate 호출 |
| 반복 저장 | 범위 선택 다이얼로그 표시 |
| 삭제 메뉴 | 삭제 확인 다이얼로그 표시 ("해당 세션을 삭제하시겠어요?") |
| 단일 세션 삭제 | THIS_ONLY로 submitDeleteSession 호출 |
| 반복 그룹 삭제 | groupId 전달하여 submitDeleteGroup 호출 |

### Uncovered branches

| File | Lines | Reason |
|------|-------|--------|
| `EditSessionModalContent.tsx` | 80–81, 91–93 | 변경 있을 때 취소/닫기 → discard confirm 흐름 미검증 |
| `EditSessionModalContent.tsx` | 115–117 | handleSaveConfirm('all') — 이후 모두 저장 선택 |
| `CreateSessionScheduleForm.tsx` | 53–54, 56–57 | clampRecurrenceEndDate 경계 조건 |

---

## 일정 관리 모바일 뷰·삭제 다이얼로그 (`src/components/admin/schedule/`)

**Measured**: 2026-11-28
**Test files**:
- `src/components/admin/schedule/general/__tests__/ScheduleManagementContent.integration.test.tsx`
- `src/components/admin/schedule/general/__tests__/AdminScheduleMobileDetailView.integration.test.tsx`
- `src/components/admin/schedule/general/__tests__/AdminMobileScheduleView.test.tsx`
- `src/components/admin/schedule/general/__tests__/AdminScheduleMobileHeader.test.tsx`
- `src/components/admin/schedule/general/__tests__/AdminScheduleMobileSearch.test.tsx`
- `src/components/admin/schedule/general/__tests__/ScheduleItem.test.tsx`
- `src/components/admin/schedule/general/__tests__/MonthNavigator.test.tsx`
- `src/components/admin/schedule/modal/__tests__/ScheduleDeleteAlertDialog.test.tsx`
- `src/utils/admin/__tests__/sessionUtils.test.ts`

**Total tests**: 72

### Coverage by file

| File | Statements | Branches | Functions | Lines |
|------|-----------|---------|---------|-------|
| `ScheduleManagementContent.tsx` | 86.75% | 71.05% | 31.03% | 86.75% |
| `AdminScheduleMobileDetailView.tsx` | 100% | 88.88% | 83.33% | 100% |
| `AdminMobileScheduleView.tsx` | 100% | 90% | 100% | 100% |
| `AdminScheduleMobileHeader.tsx` | 100% | 100% | 100% | 100% |
| `AdminScheduleMobileSearch.tsx` | 100% | 100% | 100% | 100% |
| `ScheduleItem.tsx` | 100% | 75% | 100% | 100% |
| `MonthNavigator.tsx` | 100% | 100% | 100% | 100% |
| `ScheduleDeleteAlertDialog.tsx` | 100% | 100% | 66.66% | 100% |
| `sessionUtils.ts` | 49.6% | 90.9% | 33.33% | 49.6% |

`sessionUtils.ts`는 이번에 추가한 `isSessionInProgress`만 테스트했다. 나머지 함수는 기존부터 이 파일 단독 테스트가 없다.

### Test composition

#### `ScheduleManagementContent.integration.test.tsx` (8 tests)

데이터 훅은 모킹하고 데스크톱 전용 영역·생성/수정 모달은 `null`로 대체해, 모바일 화면 전환과 삭제 흐름만 검증한다. 상세 API는 MSW.

| Case | What is verified |
|------|-----------------|
| 기본 렌더링 | 오늘 일정 목록과 하단 바(일정 모아보기) 표시 |
| 일정 클릭(모바일) | 일정 상세 화면으로 전환, 하단 바 숨김, 모달 없음 |
| 상세 뒤로 가기 | 캘린더 화면 복귀 |
| 일반 일정 삭제 | 유형별 확인 문구 → 확인 시 `deleteSchedule(id)` |
| 출석 진행 중 세션 삭제 | 삭제 불가 안내 + 확인만, `submitDeleteSession` 미호출 |
| 일정 클릭(태블릿) | 상세 모달 표시, 모바일 상세 화면 미표시 |
| 월 이동 열기 | 월 이동 화면 표시, 하단 바 숨김 |
| 연도 넘긴 뒤 월 선택 | `goToYearMonth(2027, 3)` 호출 후 캘린더 복귀 |

#### `AdminScheduleMobileDetailView.integration.test.tsx` (5 tests)

| Case | What is verified |
|------|-----------------|
| 상세 렌더링 | "일정 상세" 헤더, 상세 API의 제목·주최자·설명 |
| 뒤로 가기 | onBack 호출 |
| 수정 / 삭제 (`it.each`) | onEdit / onDelete에 일정 전달 |
| 참석자 목록 전환 | 참석자 목록 표시·수정 버튼 숨김, 뒤로 가기 시 상세 복귀(onBack 미호출) |

#### `AdminMobileScheduleView.test.tsx` (12 tests)

| Case | What is verified |
|------|-----------------|
| 날짜 헤더 | 미선택 시 오늘, 선택 시 해당 날짜와 일정 개수 |
| 일정 클릭 | onScheduleClick에 일정 전달 |
| 빈 상태 / 에러 / 로딩 | 빈 문구, 에러 문구, 로딩 중 목록·헤더 미표시 |
| [오늘] 버튼 숨김 (`it.each` 2) | 이번 달 미선택, 이번 달 오늘 선택 |
| [오늘] 버튼 표시 (`it.each` 3) | 다른 날짜 선택, 다른 달, 다른 연도 |
| [오늘] 클릭 | onGoToToday 호출 |

#### `AdminScheduleMobileHeader.test.tsx` (10 tests)

| Case | What is verified |
|------|-----------------|
| 기본 렌더링 | 제목, `2026.06, 월 선택` 버튼, 기수 "전체" |
| 선택 기수 | 기수 선택에 "7기" 표시 |
| [오늘] 노출 (`it.each` 2) | showTodayButton 값에 따른 노출 |
| 콜백 (`it.each` 4) | 월 선택·이전 달·다음 달·검색 |
| [오늘] 클릭 | onGoToToday 호출 |
| 뒤로 가기 | `router.back()` 호출 |

#### `AdminScheduleMobileSearch.test.tsx` (10 tests)

| Case | What is verified |
|------|-----------------|
| 자동 포커스 | 입력창 포커스, placeholder |
| 검색어 없음 | 결과·빈 문구 미표시 |
| 제목 / 장소 검색 (`it.each`) | 일치 일정만 표시 |
| 정규화 | 대소문자·앞뒤 공백 무시 |
| 장소 없는 일정 | 제목으로 검색됨 |
| 결과 없음 | "검색 결과가 없습니다." |
| 검색어 지우기 | 입력·결과·지우기 버튼 초기화 |
| 결과 클릭 / 취소 | onScheduleClick(일정) / onClose |

#### `ScheduleItem.test.tsx` (7 tests)

| Case | What is verified |
|------|-----------------|
| 기본 렌더링 | 제목·일·유형·장소 |
| 장소 없음 | 장소 태그 미표시 |
| 수정 | onEdit 호출 |
| 삭제 확인 (`it.each` 2) | 일반 일정·오늘이 아닌 세션의 유형별 문구, 확인 시 onDelete |
| 출석 진행 중 세션 | 삭제 불가 안내, onDelete 미호출 |
| 삭제 취소 | onDelete 미호출 |

#### `MonthNavigator.test.tsx` (5 tests)

| Case | What is verified |
|------|-----------------|
| 형식 | `YYYY.MM` 표시 |
| 이전 / 다음 달 (`it.each`) | onPrev / onNext |
| onLabelClick 없음 | 연·월이 버튼이 아님 |
| onLabelClick 있음 | `월 선택` 버튼 렌더링·클릭 시 호출 |

#### `ScheduleDeleteAlertDialog.test.tsx` (12 tests)

| Case | What is verified |
|------|-----------------|
| 닫힌 상태 | 트리거 전 미표시 |
| 유형별 문구 (`it.each` 2) | EVENT / SESSION 제목·설명 |
| 기본 유형 / 커스텀 문구 | 미지정 시 일반 일정 문구, title·description 우선 |
| 삭제 / 취소 | onConfirm 호출 여부와 닫힘 |
| inProgress | 삭제 불가 안내 + 확인만, 확인 시 onConfirm 미호출 |
| 제어 모드 (3) | open true/false 표시, 취소 시 onOpenChange(false) |

#### `sessionUtils.test.ts` (3 tests)

`isSessionInProgress` — 시작일이 오늘 / 지남 / 아직(`it.each`).

### Uncovered branches

| File | Lines | Reason |
|------|-------|--------|
| `ScheduleManagementContent.tsx` | 77–78, 102–162 등 | 데스크톱 검색·월 이동·오늘·수정 모달 삭제 핸들러. 테스트에서 데스크톱 영역과 수정 모달을 `null`로 대체 |
| `AdminScheduleMobileDetailView.tsx` | 41 | `detail.attendees`가 없을 때의 `[]` 대체 |
| `AdminMobileScheduleView.tsx` | 104 | 목록 스크롤 시 날짜 헤더 shadow — jsdom 스크롤 레이아웃 없음 |
| `ScheduleItem.tsx` | 40 | 날짜 파싱 실패 시 `'-'` |
| `ScheduleDeleteAlertDialog.tsx` | — (함수) | 오버레이 클릭 닫기 — 오버레이에 접근 가능한 역할이 없어 쿼리 우선순위 규칙으로 선택 불가 |
