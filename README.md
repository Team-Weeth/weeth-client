### Weeth-Client

Node 22 and pnpm 10.28.0 are the supported toolchain (matching CI).
With nvm: `nvm install && nvm use`, then `corepack enable` and
`corepack prepare pnpm@10.28.0 --activate`.
Install with `pnpm install --frozen-lockfile`.

See [AI tooling setup](docs/온보딩/AI-도구-설정.md) for shared MCP configuration,
personal credentials and connection verification.

### Capacitor

This project uses Capacitor with a hosted production URL.

- Production URL: `https://weeth.kr`
- iOS local development: run `pnpm dev`, then `pnpm cap:dev:ios`
- Android emulator local development: run `pnpm dev`, then `pnpm cap:dev:android`
- Sync production URL into native projects: `pnpm cap:prod:sync`
- Open native projects: `pnpm cap:open:ios` or `pnpm cap:open:android`

Override the web server at any time with `CAP_SERVER_URL`.
