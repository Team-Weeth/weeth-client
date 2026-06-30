# 테스트 커버리지 — Hooks 도메인

`src/hooks/` 하위 파일의 단위 훅 테스트 커버리지를 기록한다.

---

## useNavigationGuard (`src/hooks/useNavigationGuard.ts`)

**측정일**: 2026-06-29
**테스트 파일**: `src/hooks/__tests__/useNavigationGuard.test.ts`
**총 테스트 수**: 24개

### 파일별 커버리지

| 파일 | Statements | Branches | Functions | Lines |
|------|-----------|---------|---------|-------|
| `useNavigationGuard.ts` | **91.32%** | **82.97%** | **100%** | **91.32%** |

### 테스트 구성

#### `useNavigationGuard.test.ts` (24개)

브라우저 뒤로가기(popstate), 탭 닫기(beforeunload), 링크 클릭을 가로채는 내비게이션 가드 훅. `history.pushState`·`history.back`을 spy로 대체하고 DOM 이벤트를 직접 dispatch해 동작 검증.

| 케이스 | 검증 내용 |
|--------|---------|
| 초기 상태 | `open=false` |
| guard entry 등록 (3) | enabled=true → pushState 호출 / enabled=false → 호출 안 함 / false→true 변경 → pushState |
| popstate (2) | enabled=true → 다이얼로그 열림 / enabled=false → 열리지 않음 |
| onConfirm (2) | pendingUrl 없음 → history.back + 닫힘 / pendingUrl 있음 → router.push + 닫힘 |
| onCancel (2) | popstate 후 → 닫힘 + guard entry 재설정 / 링크 클릭 후 → 닫힘 |
| 링크 클릭 인터셉트 (6) | 같은 origin 다른 경로 → 열림 / 동일 URL → 안 열림 / 외부 도메인 → 안 열림 / target=_blank → 안 열림 / enabled=false → 안 열림 / ctrl/meta 클릭 → 안 열림 |
| beforeunload (2) | enabled=true → preventDefault 호출 / enabled=false → 호출 안 함 |
| allowNavigation (2) | 호출 후 popstate 발생해도 열리지 않음 / 호출 후 링크 클릭해도 열리지 않음 |
| Bug 1 회귀 (2) | 뒤로가기→취소→재시도 시 다이얼로그 다시 열림 / onConfirm 후 enabled false→true 재전환 시 다음 뒤로가기에서 열림 |
| Bug 2 회귀 (2) | onConfirm 직후 popstate로 다이얼로그 재표시 안 됨 / onCancel은 isLeaving 상태 무관하게 항상 다이얼로그를 닫음 |

### 미커버 브랜치

| 라인 | 내용 | 이유 |
|-----|------|------|
| 41-49 | `scheduleGuardReset` 내 setTimeout 콜백 | 3000ms 타이머 + 실제 URL 변경 없이 재현 불가. 실제 네비게이션 발생 여부 확인 로직으로 E2E 대상 |
| 76-78 | popstate에서 `enabled=false && hasGuardEntry=true` 분기 | pushState를 spy no-op으로 처리해 hasGuardEntry가 true로 세팅되지 않는 상태 조합 |

---

## 추가 예정

| 파일 | 우선순위 | 비고 |
|------|---------|------|
| `useMonthNavigator.ts` | 완료 | `src/hooks/__tests__/useMonthNavigator.test.ts` |
| `useDiscardableForm.ts` | 완료 | `src/hooks/__tests__/useDiscardableForm.test.ts` |
| `useRemainingTime.ts` | 완료 | `src/hooks/__tests__/useRemainingTime.test.ts` |
| `useCardinalSelector.ts` | 완료 | `src/hooks/__tests__/useCardinalSelector.test.ts` |
