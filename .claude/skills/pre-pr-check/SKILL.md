---
name: pre-pr-check
description: "Pre-PR development quality check. Detects duplicate code, legacy code, missing component extraction, client-component misuse, refactor opportunities, and error-prone patterns."
argument-hint: "[base branch | --staged | <commit-hash>]"
disable-model-invocation: true
allowed-tools: Glob, Grep, Read, Bash
---

# Pre-PR Check

PR을 올리기 전 변경된 코드의 **개발 품질**을 점검합니다.
버그/보안 중심의 `/code-review`와 달리, **리팩토링·재사용성·아키텍처** 관점의 검증을 수행합니다.
**모든 출력은 한국어.**

## Arguments

`$ARGUMENTS`로 검증 범위 지정. 생략 시 `main` 브랜치 대비 현재 브랜치의 모든 변경.

- `/pre-pr-check` → `git diff main...HEAD`
- `/pre-pr-check --staged` → `git diff --staged`
- `/pre-pr-check develop` → `git diff develop...HEAD`
- `/pre-pr-check abc1234` → 특정 커밋

## Workflow (순서대로)

### 1. 변경 범위 파악

```bash
git diff $ARGUMENTS --name-only   # 변경 파일 목록
git diff $ARGUMENTS --stat        # 파일별 변경 라인 수
git diff $ARGUMENTS               # 전체 diff
```

- 변경 파일을 도메인/레이어별로 분류 (UI / hooks / apis / actions / app)
- 각 파일의 전체 컨텍스트(주변 코드, import 관계)를 Read로 확인

### 2. 카테고리별 점검 (반드시 모두 수행)

각 항목마다 변경된 파일을 직접 읽고, 의심되는 부분은 Grep으로 같은 패턴이 다른 곳에도 있는지 확인.

#### A. 중복 코드 (재사용 없이 복붙)

- 동일/유사 로직이 2곳 이상에서 반복되는데 함수/훅/컴포넌트로 분리되지 않음
- 같은 utility를 여러 파일에서 인라인으로 재구현
- 같은 className 조합이 여러 컴포넌트에서 반복 → cva variant 누락
- **확인 방법:** Grep으로 의심 키워드의 출현 횟수 확인 후 호출처 비교

#### B. 레거시 / 죽은 코드

- 사용처 없는 export, 함수, 컴포넌트, 타입
- 주석 처리된 코드 블록
- 더 이상 호출되지 않는 분기 (`if (false)`, 도달 불가능한 return)
- React 19에서 불필요한 `forwardRef`, `useMemo`, `useCallback`, `React.memo`
  (React Compiler 활성화 — `CLAUDE.md` 참고)
- 사용하지 않는 import, 변수, props
- **확인 방법:** Grep으로 export 이름 호출처 검색 → 0건이면 dead

#### C. 컴포넌트 분리 누락

- 같은 JSX 구조가 한 파일 내 또는 인접 파일에서 2회 이상 반복
- 페이지/컨테이너 컴포넌트 안에 50줄 이상의 인라인 JSX 블록이 들어 있음
- prop drilling이 3 depth 이상이라 context 또는 분리가 필요
- domain 컴포넌트로 빼야 하는데 page 파일 안에 inline으로 정의됨
- **확인 방법:** 변경 파일 라인 수 + JSX 블록 깊이 확인

#### D. 서버 컴포넌트 가능성 (RSC 미적용)

- `'use client'`가 있는데 실제로는 state/effect/event handler/browser API를 사용하지 않음
- async fetch만 하는 컴포넌트가 client인 경우 → `lib/apis/` + RSC로 이전 가능
- 정적 렌더만 하는 layout/section 컴포넌트가 client
- **확인 방법:** `'use client'` 파일에서 `useState|useEffect|onClick|onChange|window|document` 검색 → 미사용이면 후보

#### E. 그 외 리팩토링 필요

- 디자인 토큰 미사용 (하드코딩된 색상/간격값)
- `cn()` 미사용 (className 직접 concat)
- cva 미사용 (인라인 조건부 className)
- 매직 넘버/문자열 (constants 파일로 빼야 함)
- 너무 긴 함수 (50줄 이상) — 책임 분리 필요
- 도메인 컴포넌트가 `components/ui/`에 있거나 그 반대
- `components/{feature}/index.ts` 또는 `components/ui/index.ts` re-export 누락
- 상대 경로 import (`../../`) — `@/` alias로 교체
- barrel export(`@/lib/apis`)를 클라이언트 훅에서 import (next/headers 충돌 위험 — `data-fetching.md` 참고)
- Zustand store에서 selector hook 미사용, devtools name 누락, action label 누락

#### F. 에러 유발 가능성

- 조건부 렌더링에서 falsy 값 노출 (`count && <Comp />` → count가 0일 때 "0"이 렌더됨)
- `useEffect` 의존성 누락/과다
- 비동기 race condition (cleanup 없음)
- nullable 값을 non-null assertion (`!`)로 처리
- 타입 단언 (`as`) 남용
- try/catch 없는 async 함수
- form 검증 없이 mutate
- 키 prop으로 index 사용 (정렬/삭제 시 버그)
- React Query queryKey 컨벤션 위반 (`['posts', id]` 형식 불일치)
- Server Action에서 `revalidatePath`/`revalidateTag` 누락
- `key` prop 누락된 list 렌더링

### 3. 결과 출력

아래 포맷을 그대로 따른다.

```markdown
# Pre-PR Check 결과

## 요약
- 변경 파일: N개 / +X / -Y 라인
- 🔴 Blocker: N (PR 머지 전 반드시 수정)
- 🟡 Warning: N (가능하면 수정)
- 🟢 Suggestion: N (선택적 개선)

---

## 🔴 Blocker

### [filename:line] 이슈 제목
**카테고리:** 중복 코드 / 레거시 / 컴포넌트 분리 / RSC 가능 / 리팩토링 / 에러 가능
**문제:** 설명
**Before:**
\`\`\`tsx
// 문제 코드
\`\`\`
**After:**
\`\`\`tsx
// 수정 코드
\`\`\`

---

## 🟡 Warning
(동일 포맷)

---

## 🟢 Suggestion
(동일 포맷, 코드 예시는 가능하면 제공)

---

## 잘된 부분
- 칭찬할 만한 부분 명시 (없으면 생략)

---

## 종합 평가
> ✅ PR 가능 / ⚠️ Blocker N건 수정 후 재검토 / 🚫 구조적 재작업 필요
```

## 분류 기준

| 등급 | 기준 |
|------|------|
| 🔴 Blocker | 에러 유발 가능성 / 레거시 코드 잔존 / 명백한 중복 / 잘못된 client component 지정 |
| 🟡 Warning | 컴포넌트 분리 권장 / 토큰 미사용 / cn·cva 미사용 / 매직 넘버 |
| 🟢 Suggestion | 가독성 개선 / 더 나은 패턴 / 선택적 RSC 전환 |

## 규칙

- **모든 출력 한국어**
- 비판은 반드시 수정 코드와 함께 제시 (코드 없는 지적 금지)
- 의심만 가는 사안은 "검증 필요"로 표시
- 잘된 부분이 있으면 명시
- 이슈 0건이면 "검증 완료 — 이슈 없음" 명시
- `/code-review`(버그/보안)와 중복되는 항목은 제외 — 이 스킬은 **개발 품질** 전용
- React 19 + React Compiler 환경임을 인지 (불필요한 메모이제이션 지적 금지가 아니라 **있다면** 제거 권고)

## 참고 문서

- `CLAUDE.md` — 프로젝트 전체 규칙
- `.claude/rules/architecture.md` — 폴더 구조 / 컴포넌트 배치
- `.claude/rules/component-guide.md` — cva 패턴 / forwardRef 금지
- `.claude/rules/data-fetching.md` — RSC vs Client / barrel import 주의
- `.claude/rules/state-management.md` — Zustand selector / queryKey 컨벤션
