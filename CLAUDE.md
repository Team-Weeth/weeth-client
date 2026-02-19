# Weeth Frontend - Claude Code Instructions

## Project Overview

Weeth 프로젝트의 프론트엔드. Figma 디자인을 기반으로 디자인 시스템을 구현합니다.

## Tech Stack

- **React 19** + TypeScript
- **Next.js 16** (App Router)
- **Tailwind CSS v4**
- **class-variance-authority (cva)** — variant 스타일 관리
- **`cn()` from `@/lib/cn`** — className 병합 (clsx + tailwind-merge)
- **Radix UI** — 접근성 있는 UI 프리미티브
- **Lucide React** — 아이콘
- **pnpm** — 패키지 매니저 (npm, yarn 사용 금지)

## Project Structure

```
src/
  app/
    globals.css          # 디자인 토큰 정의 (CSS variables, @utility)
  components/
    ui/                  # 재사용 기본 컴포넌트 (비즈니스 로직 없음)
      Button.tsx
      TextField.tsx
      dialog.tsx
      alert-dialog.tsx
      breadcrumb.tsx
      index.ts           # 모든 ui 컴포넌트 re-export
  lib/
    cn.ts                # className 병합 유틸
```

## Design Tokens (globals.css)

Figma 디자인을 코드로 옮길 때 반드시 아래 토큰을 우선 사용합니다.

**매칭 우선순위:**
1. CSS 변수 기반 Tailwind 클래스 (`bg-container-neutral`, `text-text-strong`)
2. 직접 CSS 변수 (`var(--color-primary)`)
3. 신규 토큰이 필요한 경우 → 사용자에게 먼저 확인 후 추가

**주요 토큰 카테고리:**

| 카테고리 | 예시 클래스 |
|----------|------------|
| 텍스트 색상 | `text-text-strong`, `text-text-normal`, `text-text-alternative`, `text-text-disabled`, `text-text-inverse` |
| 배경 | `bg-container-neutral`, `bg-container-neutral-interaction` |
| 버튼 | `bg-button-primary`, `bg-button-neutral` |
| Typography | `typo-h1` ~ `typo-h3`, `typo-sub1` ~ `typo-sub2`, `typo-body1` ~ `typo-body2`, `typo-caption1` ~ `typo-caption2`, `typo-button1` ~ `typo-button2` |
| Spacing | `p-100` ~ `p-500`, `gap-100` ~ `gap-400`, `px-200`, `py-300` 등 |

## Component Guidelines

### 기본 구조

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const componentVariants = cva('base-styles', {
  variants: {
    variant: {
      primary: '...',
      secondary: '...',
    },
    size: {
      lg: '...',
      md: '...',
      sm: '...',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

interface ComponentProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof componentVariants> {}

function Component({ className, variant, size, ...props }: ComponentProps) {
  return (
    <div
      className={cn(componentVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Component, componentVariants, type ComponentProps };
```

### 원칙

- `className` prop 항상 노출 (외부에서 커스텀 가능하도록)
- 하드코딩 값 사용 금지 — 반드시 디자인 토큰 사용
- 새 컴포넌트는 `src/components/ui/index.ts`에 export 추가
- Radix UI 사용 시 `asChild` 패턴으로 합성 지원

## Figma → Component Workflow

### Step 1. 디자인 분석

Figma 속성을 토큰으로 매핑하는 표를 먼저 작성합니다:

```
Figma Property  | Value         | Mapped Token/Class
--------------- | ------------- | ---------------------------
Background      | #1E2125       | bg-container-neutral
Border Radius   | 8px           | rounded-lg
Font            | Sub1 Bold     | typo-sub1 text-text-strong
Padding         | 20px          | p-500
Gap             | 12px          | gap-300
```

### Step 2. 코드 생성

위 매핑 기반으로 컴포넌트 생성.

### Step 3. 결과 요약

```
✅ 파일 생성: src/components/ui/Card.tsx
✅ 디자인 토큰: 5개 사용
⚠️  신규 토큰 필요: --shadow-card (제안: 0 2px 8px rgba(0,0,0,0.1))
```

## Git Conventions

```
feat:     새 컴포넌트 또는 기능 추가
fix:      버그 수정
style:    스타일/토큰 수정
refactor: 리팩토링
```

**주의:** main/master 브랜치 직접 커밋 금지 — 반드시 경고 후 확인 요청.
