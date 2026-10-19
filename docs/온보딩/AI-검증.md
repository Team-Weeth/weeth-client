# AI 작업 검증

- `pnpm verify:changed`: staged, unstaged, untracked 변경 검사. 커밋된 변경은 포함하지 않음.
- `pnpm verify:changed --base origin/develop`: 실제 PR base를 명시해 커밋된 변경도 포함.
- `pnpm verify:changed --dry-run`: 대상 파일과 실행 명령 확인.
- `pnpm verify:full`: 포맷, 타입, lint, 전체 Jest, build 및 하네스 테스트.
- `pnpm test:harness`: 임시 Git 저장소 기반 변경 수집과 검증 선택 테스트.

문서 변경은 포맷 검사, 소스 변경은 타입/lint/관련 Jest를 수행한다. 소스 삭제는
관련 테스트를 찾지 못할 수 있어 전체 Jest를 실행한다. 의존성 또는 설정 변경은
전체 Jest와 build도 실행한다. 관련 테스트가 없다는 결과는 테스트 커버리지 증거가 아니다.
Playwright는 자동 실행하지 않는다. 영향을 받는 화면은 필요한 인증 환경을 준비해 별도 검증한다.

Stop hook은 같은 읽기 전용 검증기를 호출한다. 실패 시 진단을 전달하고 한 번만
계속하도록 요청한다. 재시도 중이면 종료를 허용하므로 최종 보고에 해결되지 않은 실패를
명시해야 한다. 자동 hook은 CI 품질 게이트를 대체하지 않는다.
커밋 후 작업 트리가 깨끗하면 hook은 검사하지 않으므로 PR 검증에는 반드시 --base를 사용한다.

각 hook 하위 명령은 60초, 전체 hook은 300초 제한이다. 타임아웃이나 실행 도구 누락은
실패로 보고한다. `.next`를 삭제하거나 타입 검사를 제외하지 않으며, stale route type은
실행 중인 개발 서버 상태를 확인한 뒤 별도로 진단한다.

기존 사용자 변경도 대상에 포함될 수 있다. 실패가 요청 범위 밖이면 자동 수정하지 말고
해당 경로와 제한을 보고한다. PostToolUse의 저장소 전체 자동 수정은 실행하지 않는다.

참조: [Claude hook input/exit codes](https://code.claude.com/docs/en/hooks).
