# Figma to Component

Figma 디자인을 Weeth 디자인 시스템에 맞는 React 컴포넌트로 변환합니다.
Figma URL이나 스크린샷이 주어졌을 때 이 스킬을 사용합니다.

## Step 1. 디자인 분석

Figma 디자인의 레이아웃 구조를 먼저 파악합니다:
- 전체 레이아웃 방식 (flex / grid)
- 고정 크기 vs 동적 크기 요소 구분
- 텍스트 overflow 처리 필요 위치

이후 Figma 속성을 토큰으로 매핑한 표를 출력합니다:
```text
Figma Property  | Value      | Mapped Token/Class
--------------- | ---------- | -------------------------
Background      | #1E2125    | bg-container-neutral
Border Radius   | 8px        | rounded-lg
Font            | Sub1 Bold  | typo-sub1 text-text-strong
Padding         | 20px       | p-500
Gap             | 12px       | gap-300
```

**토큰 매칭 우선순위:**

1. Tailwind 토큰 클래스 (`bg-container-neutral`, `text-text-strong`)
2. CSS 변수 (`var(--color-primary)`)
3. 신규 토큰 필요 시 → 사용자에게 제안 후 확인합니다

## Step 2. 기존 패턴 확인

`src/components/ui/` 기존 컴포넌트를 먼저 읽어 패턴을 파악합니다.

## Step 3. 컴포넌트 생성
```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const variants = cva('base-styles', {
  variants: {
    variant: { primary: '...', secondary: '...' },
    size: { lg: '...', md: '...', sm: '...' },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
});

interface Props extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof variants> {}

function Component({ className, variant, size, ...props }: Props) {
  return <div className={cn(variants({ variant, size }), className)} {...props} />;
}

export { Component, variants, type Props };
```

**레이아웃 원칙:**

- **텍스트 overflow 처리:** 잘려야 하는 텍스트에는 `truncate`를 사용하고, flex/grid 자식에는 `min-w-0`을 추가합니다.
- **간격 구조:** 부모에 `gap-*` 클래스를 사용합니다. 간격을 위한 불필요한 wrapper div를 만들지 않습니다.
- **고정 높이 vs 동적 높이:** 리스트 행처럼 균일한 높이가 필요한 요소에는 `h-*`을 명시합니다. 그 외에는 콘텐츠에 의한 동적 높이를 유지합니다.
- **계층 구조 정확도:** Figma에서 어떤 요소가 어디 안에 있는지 정확히 반영합니다. 예: 페이지네이션이 메인 영역 안인지 밖인지에 따라 구조가 달라집니다.

**기타 원칙:**

- 하드코딩 값 사용 금지
- `className` 항상 노출
- Radix UI 사용 시 `asChild` 지원
- 생성 후 `src/components/ui/index.ts`에 export 추가
- Figma 디자인은 desktop(1032px) 기준으로 간주합니다
- 모바일/태블릿 대응이 명시되지 않은 경우, 사용자에게 확인 후 진행합니다
- 브레이크포인트: `mobile(360px)`, `tablet(696px)`, `desktop(1032px)`

## Step 4. 결과 요약
```text
✅ 파일 생성: src/components/ui/ComponentName.tsx
✅ 디자인 토큰: N개 사용
⚠️  신규 토큰 필요: --token-name (제안값)
```

**셀프 체크:**
- [ ] 하드코딩 값 없음
- [ ] className 노출됨
- [ ] index.ts에 export 추가됨
- [ ] 디자인 토큰만 사용됨