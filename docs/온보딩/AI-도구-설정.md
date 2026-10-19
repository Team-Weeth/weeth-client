# AI 도구 설정

## 실행 환경

CI와 같이 Node 22, pnpm 10.28.0을 사용한다. `.nvmrc`는 Node 22 계열을 선택하고
`packageManager`는 pnpm 버전을 고정한다. Node 패치 버전까지 고정한 것은 아니다.
`nvm install && nvm use`, `corepack enable`, `corepack prepare pnpm@10.28.0 --activate`
후 `pnpm install --frozen-lockfile`을 실행한다. Corepack이 없는 배포판은 Node 설치를
확인하고 pnpm 공식 설치 절차로 같은 버전을 설치한다.
GUI 에이전트가 pnpm을 찾지 못하면 PATH를 확인하고 앱을 다시 시작한다.

## MCP

Claude 프로젝트 MCP는 루트 `.mcp.json`에 정의한다. `.claude/settings.json`은
권한과 hook 설정이다. 현재 구성은 Playwright 0.0.83과 OpenAPI 서버 1.16.1을
정확한 버전으로 실행한다. dlx의 전이 의존성까지 lockfile로 고정한 것은 아니다.
버전 갱신은 별도 PR에서 초기화와 tools/list를 확인한다.

기존에 gitignore된 개인 `.mcp.json`을 사용했다면 업데이트 전에 저장소 밖으로
백업하고 개인 서버/토큰을 Claude local 또는 user scope로 옮긴다. 공유 파일에
토큰을 커밋하지 않는다. `claude mcp get playwright`, `claude mcp get weeth-api`와
대화형 `/mcp`에서 실제 연결 및 프로젝트 승인 상태를 확인한다.
사용하지 않는 서버는 개인 설정에서 비활성화할 수 있다.

OpenAPI는 Swagger UI HTML이 아닌 `/v3/api-docs/public` JSON을 읽는다.
dynamic 모드는 도구 설명을 필요할 때 탐색하는 방식이며 읽기 전용 권한이 아니다.
API 변경 요청 실행은 사용자 작업 범위에 포함될 때만 허용하며, 운영 서버나
관리자 인증을 기본 설정에 추가하지 않는다. 인증 헤더는 필요한 경우 개인 설정에서만 제공한다.
개발 서버 연결에 실패하면 API 문서를 확인했다고 주장하지 말고 연결 제한을 보고한다.

이 파일은 Claude용 설정이며 Codex가 자동으로 읽는다는 뜻은 아니다. 다른 도구에는
그 도구의 MCP 설정 방식으로 동일한 버전/환경 변수를 등록한다.

## 검증 기록

- 개발 OpenAPI URL은 이 작업 환경에서 20초 연결 타임아웃. 실제 API 연결 검증은 미완료.
- 패키지 README로 환경 변수, stdio 및 dynamic 모드 지원을 확인.
- 두 고정 버전 패키지의 stdio initialize 및 tools/list 통과. OpenAPI 서버는
  실제 개발 API 대신 메모리 내 최소 OpenAPI fixture로 검증했으며 API 호출은 실행하지 않음.
- 앱 검증은 CI와 동일한 Node 22에서 수행.

참조: [Claude MCP 설정](https://code.claude.com/docs/en/mcp),
[OpenAPI MCP 패키지](https://github.com/ivo-toby/mcp-openapi-server),
[pnpm 설치](https://pnpm.io/installation).
