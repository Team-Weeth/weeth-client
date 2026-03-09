---
name: code-review
description: "PR/커밋 코드 변경사항을 리뷰한다. 버그, 보안 취약점, 성능 이슈를 탐지하고 구체적인 수정 제안을 제공한다."
argument-hint: "[HEAD~1 | --staged | <commit-hash>]"
disable-model-invocation: true
allowed-tools: Glob, Grep, Read, Bash
---

# Code Review

코드 변경사항을 체계적으로 분석해 이슈를 탐지하고 실행 가능한 수정안을 제공한다.
**모든 출력은 반드시 한국어(Korean)로 작성한다.**

## 인수

`$ARGUMENTS`로 리뷰 범위를 지정할 수 있다. 생략 시 `HEAD~1`을 기본으로 사용한다.

- `/code-review` → `git diff HEAD~1`
- `/code-review --staged` → `git diff --staged`
- `/code-review abc1234` → 특정 커밋

## Workflow (순서 엄수)

### 1. 변경사항 분석

```bash
git diff $ARGUMENTS --name-only   # 변경 파일 목록
git diff $ARGUMENTS               # 전체 diff
```

- 변경 파일 나열 및 영향도 파악
- 관련 테스트 파일 존재 여부 확인

### 2. 카테고리별 리뷰 (순서대로)

1. **Critical** — 버그, 보안 취약점, 데이터 손실 위험
2. **Major** — 성능 이슈, 아키텍처 위반, 테스트 누락
3. **Minor** — 코드 스타일, 네이밍, 중복 코드
4. **Suggestion** — 더 나은 구현, React/TS 관용 패턴

### 3. 결과 출력

`template.md`의 형식을 반드시 따라 출력한다.

## 리뷰 체크리스트

### Bug/Logic

- 조건부 렌더링 falsy 값 노출 (`count && <Comp />` → count가 0이면 "0" 렌더링)
- 비동기 처리 누락 (loading/error 상태 처리)
- `useEffect` 의존성 배열 누락 또는 과다 포함
- 이벤트 핸들러 메모리 누수 (cleanup 없는 구독, 타이머)
- `key` prop 오용 (`index` 사용, 중복 key)

### Security

- `dangerouslySetInnerHTML` XSS 위험
- 민감 정보 노출 (console.log, 에러 메시지에 토큰/비밀번호)
- 환경 변수 노출 (`NEXT_PUBLIC_` 접두사 주의)
- 사용자 입력 미검증 (폼 validation 누락)
- 외부 URL 직접 삽입 (`href={userInput}` → `javascript:` 공격)

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

### Accessibility (a11y)

- 인터랙티브 요소에 `aria-label` 누락 (아이콘 버튼 등)
- 키보드 접근 불가 (`onClick`만 있고 `onKeyDown` 없는 `<div>`)
- 시맨틱 마크업 미사용 (`<div>` 버튼, `<div>` 링크)
- 이미지 `alt` 텍스트 누락 또는 빈 문자열 오용
- 폼 `label`과 `input` 연결 누락

## 규칙

- **모든 출력은 한국어**
- 항상 구체적인 수정 코드 제시 (비판만 금지)
- 잘 작성된 코드도 칭찬하기
- 불확실한 이슈는 "확인 필요"로 표시
- 이슈 없으면 "리뷰 완료 - 이슈 없음" 명시

## 지원 파일

- 출력 형식: [template.md](template.md)
