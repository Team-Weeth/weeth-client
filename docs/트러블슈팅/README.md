# 트러블슈팅

겪었던 에러와 해결법을 남기는 곳. **두 번째 사람이 같은 삽질을 하지 않게** 하는 게 목적.

## 언제 쓰나

- 1시간 이상 막혔다가 해결한 문제
- 구글 검색으로 잘 안 나오는 문제
- 우리 코드/스택 조합에서만 발생하는 문제
- Claude Code/Desktop이 헛다리 짚었다가 결국 풀어준 문제

## 파일명 규칙

```
{도메인}-{짧은-제목}.md
```

예: `nextjs-barrel-import-build-fail.md`, `tiptap-image-paste-error.md`

## 작성 양식 (간단해도 됨)

```markdown
# 제목

## 증상

- 에러 메시지
- 어떤 상황에서 발생

## 원인

- 진짜 원인 (추정 말고)

## 해결

- 한 일

## 참고

- 관련 PR, 이슈, 외부 링크
```

## 알려진 함정

- **E2E 스냅샷은 반드시 `Update E2E Snapshots` workflow로 갱신** — 로컬(win32)에서 생성한 스냅샷을 직접 커밋하면 CI(linux)가 비교 불가. ([[e2e-snapshot-os-mismatch]])
- **`@/lib/apis` 배럴 임포트는 클라이언트에서 빌드 깨짐** — `apiServer`가 `next/headers`를 끌고 옴. 직접 경로(`@/lib/apis/mypage`)로 가져올 것. ([[../아키텍처/결정-기록/ADR-002-data-fetching-strategy]])
- **`next/jest` 임포트 시 `.js` 확장자 필수** — `next/jest.js`로 써야 ESM에서 동작.
- **React Compiler 켜진 상태에서 수동 `useMemo`/`useCallback`은 노이즈** — 측정 없이 추가 금지. ([[../아키텍처/결정-기록/ADR-001-react-compiler]])
- **`forwardRef` 사용 금지** — React 19에선 `ref`가 일반 prop. 발견 시 즉시 리팩터링.
- **revert된 머지를 다시 통합하면 대량 충돌** — `Revert Merge`한 브랜치를 나중에 재머지하면 변경이 안 살아나고 `modify/delete` 충돌 폭발. 파일별로 잡지 말고 `revert의 revert`로 근본 원인부터 제거할 것. ([[git-revert된-머지-재통합-충돌]])
