# AI 작업 검증

- `pnpm verify:changed`: staged, unstaged, untracked 변경 검사. 커밋된 변경은 포함하지 않음.
- `pnpm verify:changed --base origin/develop`: 실제 PR base를 명시해 커밋된 변경도 포함.
- `pnpm verify:changed --dry-run`: 대상 파일과 실행 명령 확인.
- `pnpm verify:full`: 포맷, 타입, lint, 전체 Jest, build 및 하네스 테스트.
- `pnpm test:harness`: 임시 Git 저장소 기반 변경 수집과 검증 선택 테스트.

문서 변경은 포맷 검사, 소스 변경은 타입/변경 파일 lint/관련 Jest를 수행한다. 소스 삭제는
관련 테스트를 찾지 못할 수 있어 전체 Jest를 실행한다. 의존성 또는 설정 변경은
전체 lint, 전체 Jest와 build도 실행한다. 관련 테스트가 없다는 결과는 테스트 커버리지 증거가 아니다.
Playwright는 자동 실행하지 않는다. 영향을 받는 화면은 필요한 인증 환경을 준비해 별도 검증한다.

## Claude hook

- `UserPromptSubmit`: 턴 시작 시 작업 트리 변경 파일의 내용 해시를 OS 임시 디렉터리에 기록한다.
- `PostToolUse`(Edit/Write/MultiEdit): 편집한 파일 하나만 Prettier로 정리한다. `.prettierignore`를
  따르며 실패해도 편집을 막지 않는다. 저장소 전체 자동 수정은 실행하지 않는다.
- `Stop`: 턴 시작 이후 내용이 바뀐 파일만 검증한다. 기존 사용자 WIP는 이번 턴에 바뀌지 않았다면
  대상이 아니다. 코드 변경이 없는 턴은 검사 없이 종료한다. 턴 기록이 없으면 작업 트리 전체로 대체한다.

Stop hook은 매 턴 실행되므로 typecheck, 변경 파일 lint, 관련 Jest만 수행한다. 전체 lint/Jest와
build는 의존성/설정 변경이나 소스 삭제가 있어도 hook에서 실행하지 않으며, PR 전에
`pnpm verify:changed --base <PR base>`와 CI로 확인한다. Bash로 수정한 파일도 내용 해시로 감지하지만
PostToolUse 포맷은 Edit/Write 도구에만 적용된다.

실패 시 진단을 전달하고 한 번만 계속하도록 요청한다. 재시도 중이면 종료를 허용하므로 최종 보고에
해결되지 않은 실패를 명시해야 한다. 자동 hook은 CI 품질 게이트를 대체하지 않는다.
커밋 후 작업 트리가 깨끗하면 hook은 검사하지 않으므로 PR 검증에는 반드시 --base를 사용한다.

각 hook 하위 명령은 60초, 전체 Stop hook은 300초 제한이다. 타임아웃이나 실행 도구 누락은
실패로 보고한다. `.next`를 삭제하거나 타입 검사를 제외하지 않으며, stale route type은
실행 중인 개발 서버 상태를 확인한 뒤 별도로 진단한다.

실패가 요청 범위 밖이면 자동 수정하지 말고 해당 경로와 제한을 보고한다.

## 공유 설정 검증

`.claude/settings.json`, `.mcp.json`, `package.json`은 Prettier 제외 여부와 관계없이 JSON 문법을
검사한다. `.mcp.json`의 `env`/`headers`/인자에 토큰·키·인증 헤더가 값으로 들어 있으면 실패한다.
인증 값은 `${VAR}` 참조나 Claude local/user scope로 제공한다.

참조: [Claude hook input/exit codes](https://code.claude.com/docs/en/hooks).
