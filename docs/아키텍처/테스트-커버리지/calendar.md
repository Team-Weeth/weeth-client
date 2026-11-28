# Test Coverage — Calendar Domain

Records unit test coverage for files under `src/components/calendar/`.

---

## 월 그리드·월 이동 (`src/components/calendar/`)

**Measured**: 2026-11-28
**Test files**:
- `src/components/calendar/__tests__/MonthGrid.test.tsx`
- `src/components/calendar/__tests__/CalendarMonthPicker.test.tsx`

**Total tests**: 15

### Coverage by file

| File | Statements | Branches | Functions | Lines |
|------|-----------|---------|---------|-------|
| `MonthGrid.tsx` | 100% | 82.6% | 100% | 100% |
| `CalendarMonthPicker.tsx` | 100% | 100% | 100% | 100% |
| **Overall average** | 100% | 91.3% | 100% | 100% |

### Test composition

#### `MonthGrid.test.tsx` (7 tests)

사용자 캘린더(`CalendarMobileGrid`)와 어드민 모바일 캘린더(`AdminMobileCalendarGrid`)가 공유하는 월 그리드. 시스템 시간을 2026-06-15로 고정한다.

| Case | What is verified |
|------|-----------------|
| 칸 수 | 6주 42칸 날짜 버튼 |
| 활성/비활성 | 이번 달만 선택 가능, 앞뒤 달 비활성 |
| 오늘 | `(오늘)` 접근성 라벨 |
| 선택 상태 | 선택 날짜만 `aria-pressed=true` |
| 날짜 클릭 | onDateClick에 `YYYY-MM-DD` 전달 |
| 다른 달 클릭 | onDateClick 미호출 |
| 1월 경계 | 앞 칸을 전년도 12월로 채움 |

#### `CalendarMonthPicker.test.tsx` (8 tests)

| Case | What is verified |
|------|-----------------|
| 기본 렌더링 | 연도 제목, 1~12월 버튼, 스와이프 안내 |
| 선택 상태 | 선택한 월만 `aria-pressed=true` |
| 범위 밖 선택값 | 선택된 월 없음 (어드민 월 이동에서 다른 연도를 볼 때 0 전달) |
| 월 클릭 | onMonthSelect(월) |
| 이전 / 다음 연도 (`it.each`) | onYearChange(연도 ∓ 1) |
| 오늘 날짜로 이동 | onGoToToday 호출 |
| 선택 핸들러 생략 | onYearChange 없이 눌러도 오류 없음 |

### Uncovered branches

| Line | Content | Reason |
|------|---------|--------|
| `MonthGrid.tsx` 31–32 | 일정 유형별 점 표시 | 점에 텍스트·역할이 없어 RTL로 확인하려면 클래스 단언이 필요해 제외. 점에 접근성 표현(예: `sr-only` 텍스트)을 추가하면 검증 가능 |

---

## Planned

| File | Priority | Notes |
|------|----------|-------|
| `CalendarMobileScheduleDetailContent.tsx` | 낮음 | `CalendarMain.test`에서 모킹 중. `valueTypography` 전달과 필드 렌더링 |
| `CalendarMobileGrid.tsx` | 낮음 | 스토어 연동 래퍼. 그리드 로직은 `MonthGrid`에서 검증 |
