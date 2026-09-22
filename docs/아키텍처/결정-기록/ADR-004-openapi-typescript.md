# ADR-004: openapi-typescript로 API 타입 자동 생성

- **status**: accepted
- **date**: 2026-08-21
- **관련**: [[../폴더-구조]], [[../api-타입-사용법]]

## 맥락

기존에는 백엔드 API와 주고받는 타입을 손으로 직접 작성했다. 문제는 다음과 같다.

1. **드리프트**: 백엔드 스펙이 바뀌어도 프론트 타입이 자동으로 갱신되지 않아 런타임 에러가 뒤늦게 발견됨.
2. **중복 작업**: 백엔드가 이미 Swagger로 스펙을 정의하는데 프론트가 같은 내용을 다시 타이핑함.
3. **불일치 위험**: 손으로 쓴 타입이 실제 API 응답과 다른 필드명·타입을 가지고 있어도 컴파일 단계에서 잡히지 않음.

백엔드에는 두 개의 분리된 Swagger 스펙이 존재한다.

- **Public**: 일반 사용자 앱이 사용하는 API (`/v3/api-docs/public`)
- **Admin**: 어드민 대시보드 전용 API (`/v3/api-docs/admin`)

## 결정

1. **`openapi-typescript`로 타입 자동 생성** — 각 명령어로 스펙별 `.d.ts`를 갱신함.
   - `pnpm generate:types` → `src/types/api.d.ts` (Public)
   - `pnpm generate:types:admin` → `src/types/admin-api.d.ts` (Admin)
2. **도메인별 추출 파일 운영** — 긴 Java FQCN 스키마 키를 직접 쓰지 않고, 도메인 파일에 짧은 별칭을 정의해 사용.
3. **어드민 타입 분리** — `src/types/api/admin/` 하위에 별도 파일을 두고, 타입 이름에 `Admin` 접두사를 붙여 일반 API 타입과의 충돌을 방지.
4. **기존 손으로 쓴 타입은 유지** — 이미 사용 중인 `src/types/board.ts` 등은 건드리지 않음. 새로 개발하는 기능부터 생성 타입을 사용.

```
src/types/
  api.d.ts              ← 자동 생성 (Public, 직접 수정 금지)
  admin-api.d.ts        ← 자동 생성 (Admin, 직접 수정 금지)
  api/
    auth.ts             ← 도메인별 별칭 (직접 관리)
    user.ts
    club.ts
    board.ts
    attendance.ts
    account.ts
    schedule.ts
    file.ts
    university.ts
    dashboard.ts
    index.ts            ← barrel
    admin/
      club.ts           ← 어드민 도메인별 별칭 (Admin 접두사)
      member.ts
      board.ts
      session.ts
      attendance.ts
      schedule.ts
      account.ts
      cardinal.ts
      index.ts          ← barrel
```

## 이유

- 백엔드 스펙이 변경되면 generate 명령어 한 번으로 타입 에러가 컴파일 타임에 즉시 드러남.
- 새 API를 붙일 때 타입을 손으로 쓰지 않아도 됨 → 코드 리뷰에서 타입 정합성 논쟁이 사라짐.
- Public·Admin 스펙을 파일로 분리하므로 `components['schemas']` 키가 섞이지 않음.
- `Admin` 접두사 규칙 덕분에 같은 파일에서 양쪽 타입을 동시에 import해도 이름 충돌이 없음.
- 도메인 파일이 없으면 직접 `components['schemas']['...']`로 접근 가능해 유연함.

## 대안 / 트레이드오프

| 대안 | 기각 이유 |
|------|-----------|
| Swagger Codegen (전체 클라이언트 생성) | 생성 코드가 과함, 커스텀 어렵고 `axios` 인스턴스와 충돌 |
| 계속 손으로 쓰기 | 드리프트 문제 해결 안 됨 |
| Zod로 스키마 작성 | 런타임 검증은 좋지만 코드량 증가, 백엔드 스펙과 여전히 수동 동기화 필요 |
| Public·Admin 스펙을 하나의 파일로 합치기 | 스키마 키 충돌 가능성, 어드민 전용 타입이 일반 API 번들에 포함될 위험 |

트레이드오프: 백엔드가 Swagger 스펙을 업데이트해야 프론트가 정확한 타입을 얻을 수 있음. 백엔드 스펙이 잘못되면 타입도 잘못됨.

## 영향

- 새 기능 개발 시 `@/types/api/{domain}` 또는 `@/types/api/admin/{domain}`에서 import.
- `src/types/api.d.ts`, `src/types/admin-api.d.ts`는 직접 수정하지 않음.
- 도메인 파일에 없는 타입은 도메인 파일에 추가하거나 `components['schemas']`로 직접 접근.
- 어드민 타입 이름은 반드시 `Admin` 접두사를 붙인다.
- 실제 사용법 → [[../api-타입-사용법]]
