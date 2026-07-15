### Weeth-Client

### Capacitor

This project uses Capacitor with a hosted production URL.

- Production URL: `https://weeth.kr`
- iOS local development: run `pnpm dev`, then `pnpm cap:dev:ios`
- Android emulator local development: run `pnpm dev`, then `pnpm cap:dev:android`
- Sync production URL into native projects: `pnpm cap:prod:sync`
- Open native projects: `pnpm cap:open:ios` or `pnpm cap:open:android`

Override the web server at any time with `CAP_SERVER_URL`.
