# Project Overview

Weeth client는 동아리 관리/커뮤니티 서비스로 Next.js 16 기반 프로젝트

## Tech Stack

- React 19 + TypeScript, Next.js 16 (App Router)
- Tailwind CSS v4, class-variance-authority (cva)
- `cn()` from `@/lib/cn` — className 병합
- Radix UI, shadcn/ui 사용
- **pnpm** 전용 (npm/yarn 사용 금지)
- tanstack query, zustand
- axios (API client), next/image, next/font
- React Server Components (RSC) + Server Actions
- 인증: 쿠키 기반 (accessToken/refreshToken)

## Project Structure

```text
src/
  app/globals.css        # 디자인 토큰 (CSS variables, @utility)
  components/ui/         # 재사용 UI 컴포넌트, index.ts에서 re-export
  lib/cn.ts              # className 병합 유틸
```

→ 상세 구조: `.claude/rules/architecture.md`

## Design Tokens

하드코딩 금지. 반드시 아래 토큰 우선 사용. 신규 토큰 필요 시 사용자 확인 후 추가.

| 카테고리   | 클래스 예시                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| 텍스트     | `text-text-strong` `text-text-normal` `text-text-alternative` `text-text-disabled` `text-text-inverse` |
| 배경       | `bg-container-neutral` `bg-container-neutral-interaction`                                              |
| 버튼       | `bg-button-primary` `bg-button-neutral`                                                                |
| Typography | `typo-h1~h3` `typo-sub1~2` `typo-body1~2` `typo-caption1~2` `typo-button1~2`                           |
| Spacing    | `p-100~500` `gap-100~400`                                                                              |

→ 전체 토큰: `.claude/rules/design-tokens.md`

## Component Pattern

```tsx
const variants = cva('base', { variants: { variant: {}, size: {} }, defaultVariants: {} });

interface Props extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof variants> {}

function Component({ className, variant, size, ...props }: Props) {
  return <div className={cn(variants({ variant, size }), className)} {...props} />;
}

export { Component, variants, type Props };
```

- `className` 항상 노출, Radix 사용 시 `asChild` 지원
- 새 컴포넌트는 `src/components/ui/index.ts`에 export 추가

→ 상세 가이드: `.claude/rules/component-guide.md`

## Git Conventions

```text
feat / fix / style / refactor / ci / chore
```

"[type]: commit messgage" 형식으로 사용

main 브랜치 직접 커밋 금지.

## 주요 명령어

pnpm eslint, prettier 체크
- **Dev:** `pnpm dev` / **Build:** `pnpm build`

## Detail Rules

Architecture, code style, 컴포넌트 가이드, 상태관리 가이드 등 and git conventions are documented in .claude/rules/. Refer to those files for comprehensive guidance on each topic.
