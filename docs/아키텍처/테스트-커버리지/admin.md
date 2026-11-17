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

**Measured**: 2026-11-16
**Test files**:
- `src/components/admin/schedule/modal/__tests__/CreateSessionScheduleForm.test.tsx`
- `src/components/admin/schedule/modal/__tests__/EditSessionModalContent.test.tsx`

**Total tests**: 16

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

#### `EditSessionModalContent.test.tsx` (10 tests)

단건/반복 세션 저장·삭제 분기, 변경 감지, 닫기 흐름 검증.

| Case | What is verified |
|------|-----------------|
| 헤더 렌더링 | "세션 수정" 텍스트, 저장/취소 버튼 |
| 기존 제목 표시 | 초기 form 값 반영 |
| 변경 없이 취소 | onClose 즉시 호출 |
| 변경 없이 닫기 | onClose 즉시 호출 |
| 비반복 저장 | THIS_ONLY scope로 submitUpdate 호출 |
| 반복 저장 | 범위 선택 다이얼로그 표시 |
| 삭제 메뉴 | 삭제 확인 다이얼로그 표시 |
| 단일 세션 삭제 | THIS_ONLY로 submitDeleteSession 호출 |
| 반복 그룹 삭제 | groupId 전달하여 submitDeleteGroup 호출 |

### Uncovered branches

| File | Lines | Reason |
|------|-------|--------|
| `EditSessionModalContent.tsx` | 80–81, 91–93 | 변경 있을 때 취소/닫기 → discard confirm 흐름 미검증 |
| `EditSessionModalContent.tsx` | 115–117 | handleSaveConfirm('all') — 이후 모두 저장 선택 |
| `CreateSessionScheduleForm.tsx` | 53–54, 56–57 | clampRecurrenceEndDate 경계 조건 |
