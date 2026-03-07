---
name: code-review
description: "Review PR/commit code changes. Detects bugs, security vulnerabilities, performance issues and provides concrete fix suggestions."
allowed-tools: Glob, Grep, Read, Bash
---

# Code Review

Systematically review code changes, detect issues, and provide actionable fixes.
**All output MUST be written in Korean (한국어).**

## Workflow (MUST follow in order)

### 1. Analyze Changes
```bash
git diff HEAD~1 --name-only  # or git diff --staged --name-only
git diff HEAD~1              # or git diff --staged
```
- 변경된 파일 목록 나열
- 변경 범위 및 영향도 파악
- 관련 테스트 파일 존재 여부 확인

### 2. Review by Category (in order)
1. **Critical**: 버그, 보안 취약점, 데이터 손실 위험
2. **Major**: 성능 문제, 아키텍처 위반, 테스트 누락
3. **Minor**: 코드 스타일, 네이밍, 중복 코드
4. **Suggestion**: 더 나은 구현, React/TS 관용 패턴

### 3. Output Review Result
각 이슈마다 아래를 제공:
- 파일명과 줄 번호
- 문제 설명
- 심각도 (Critical/Major/Minor/Suggestion)
- 수정 전/후 코드 예시

## Review Checklist

### Bug/Logic
- 조건부 렌더링의 falsy 값 노출 (`count && <Comp />` → count가 0이면 "0" 렌더링)
- 비동기 처리 누락 (loading/error 상태 처리)
- useEffect 의존성 배열 누락 또는 과다 포함
- 이벤트 핸들러 메모리 누수 (cleanup 없는 구독, 타이머)
- key prop 오용 (`index` 사용, 중복 key)

### Security
- dangerouslySetInnerHTML XSS 위험
- 민감 정보 노출 (console.log, 에러 메시지에 토큰/비밀번호)
- 환경 변수 노출 (`NEXT_PUBLIC_` 접두사 주의)
- 사용자 입력 미검증 (폼 validation 누락)
- 외부 URL 직접 삽입 (`href={userInput}` → javascript: 공격)

### Performance
- 불필요한 리렌더링 (useMemo/useCallback 누락, 객체/배열 인라인 선언)
- 과도한 번들 사이즈 (무분별한 라이브러리 전체 import)
- 이미지 최적화 누락 (`<img>` 대신 `next/image` 미사용)
- 무한 루프 위험 (useEffect 내부에서 의존 state 변경)
- 비용이 큰 연산의 메모이제이션 누락

### Architecture
- 컴포넌트 계층 준수: Page → Feature 컴포넌트 → UI 컴포넌트 (역방향 의존 금지)
- UI 컴포넌트(`src/components/ui/`)에 비즈니스 로직 포함 금지
- 디자인 토큰 우선 사용 (하드코딩된 색상값, 간격값 금지)
- `cn()` 미사용 (className 직접 문자열 연결 금지)
- cva variant 미활용 (조건부 className 인라인 처리)
- `src/components/ui/index.ts` re-export 누락

### TypeScript
- `any` 타입 남용
- 타입 단언(`as`) 과다 사용
- 옵셔널 체이닝(`?.`) 미사용
- 명시적 반환 타입 누락 (컴포넌트 Props, API 응답 타입)
- `interface` vs `type` 혼용 (일관성 유지)

### Accessibility (a11y)
- 인터랙티브 요소에 `aria-label` 누락 (아이콘 버튼 등)
- 키보드 접근 불가 (`onClick`만 있고 `onKeyDown` 없는 `<div>`)
- 시맨틱 마크업 미사용 (`<div>` 버튼, `<div>` 링크)
- 이미지 `alt` 텍스트 누락 또는 빈 문자열 오용
- 폼 `label`과 `input` 연결 누락

## Output Format

```markdown
# 코드 리뷰 결과

## 요약
- Critical: N건
- Major: N건
- Minor: N건
- Suggestion: N건

## Critical 이슈
### [Button.tsx:23] falsy 값 렌더링 버그
**문제**: `count && <Badge />` 패턴에서 `count`가 0일 때 "0"이 화면에 렌더링됩니다.
**수정 전**:
```tsx
{count && <Badge count={count} />}
```
**수정 후**:
```tsx
{count > 0 && <Badge count={count} />}
```

## Major 이슈
### [UserCard.tsx:18] 불필요한 리렌더링
**문제**: 컴포넌트 내부에서 객체를 인라인 선언하여 렌더링마다 새 참조가 생성됩니다.
**수정 전**:
```tsx
<Component style={{ color: 'red' }} />
```
**수정 후**:
```tsx
const style = useMemo(() => ({ color: 'red' }), []);
<Component style={style} />
```

## Minor 이슈
### [ProfilePage.tsx:10] 하드코딩된 색상값
**문제**: 디자인 토큰 대신 Tailwind 임의값을 사용하고 있습니다.
**수정 전**:
```tsx
<div className="text-[#1A1A1A]" />
```
**수정 후**:
```tsx
<div className="text-text-strong" />
```

## Suggestion
### [SearchInput.tsx:5] cva variant 활용
**제안**: 조건부 className을 인라인으로 처리하는 대신 cva로 variant를 정의하면 재사용성이 높아집니다.

## 좋은 점
- `cn()` 유틸을 일관성 있게 사용하고 있습니다.
- forwardRef 패턴이 올바르게 적용되어 있습니다.

## 전체 평가
⚠️ 수정 필요 - Critical 1건, Major 1건 수정 후 재확인 부탁드립니다.
```

## Rules
- **All output in Korean (한국어)**
- 항상 구체적인 수정 코드 제시 (비판만 금지)
- 잘 작성된 코드도 칭찬하기
- 불확실한 이슈는 "확인 필요"로 표시
- 이슈 없으면 "리뷰 완료 - 이슈 없음" 명시
