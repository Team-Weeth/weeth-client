# Test Coverage — Alert Domain

Records unit test coverage for files under `src/components/alert/`.

---

## CustomAlertDialog (`src/components/alert/CustomAlertDialog.tsx`)

**Measured**: 2026-11-16
**Test file**: `src/components/alert/__tests__/CustomAlertDialog.test.tsx`
**Total tests**: 10

### Coverage by file

| File | Statements | Branches | Functions | Lines |
|------|-----------|---------|---------|-------|
| `CustomAlertDialog.tsx` | 94.79% | 66.66% | 100% | 94.79% |

### Test composition

#### `CustomAlertDialog.test.tsx` (10 tests)

Radix AlertDialog 래퍼의 open/closed 상태, 버튼 렌더링, 콜백 호출 검증.

| Case | What is verified |
|------|-----------------|
| 열린 상태 렌더링 | 제목·액션 버튼 표시 |
| 닫힌 상태 | 콘텐츠 미표시 |
| description 있음 | 설명 텍스트 표시 |
| description 없음 | 설명 미표시 |
| onAction 호출 | 액션 버튼 클릭 |
| cancelLabel | 취소 버튼 렌더링 |
| onCancel 호출 | 취소 버튼 클릭 |
| secondActionLabel | 두 번째 버튼 렌더링 |
| onSecondAction 호출 | 두 번째 버튼 클릭 |
| children 렌더링 | 슬롯 자식 표시 |
| title 개행 | `\n` 포함 제목 렌더링 |

### Uncovered branches

| Lines | Reason |
|-------|--------|
| 81 | `onDismiss` 호출 경로 — pointerdown 외부 클릭 시나리오 (타이머 의존) |
| 156–163 | `placement === 'center'` 분기 (overlay + Portal 사용) |
