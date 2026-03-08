---
name: seo-review
description: 프로젝트의 SEO 상태를 점검하고 개선 사항을 리포트합니다. SEO 점검 또는 리뷰 요청 시 사용합니다. 특정 경로가 주어지면 해당 경로만 점검하고, 없으면 src/app/ 전체를 점검합니다.
argument-hint: "[경로]"
---

시맨틱 구조(heading, img 등) 점검 시에는 `src/components/` 내부도 함께 확인합니다.

## 프로젝트 컨텍스트

- Next.js 16 App Router (React 19)
- `layout.tsx`에서 `export const metadata` 또는 `generateMetadata()` 사용
- 루트 레이아웃: `src/app/layout.tsx`
- Route Groups: `(public)` 랜딩/인증, `(private)` 로그인 후 페이지
- 한국어 단일 언어 (`lang="ko"`)

## Step 1. 현황 수집

아래 파일들을 읽어 현재 SEO 상태를 파악합니다:

1. `src/app/layout.tsx` — 루트 metadata
2. 각 route group의 `layout.tsx` — 중첩 metadata
3. 각 `page.tsx` — 페이지별 metadata / generateMetadata
4. `src/app/sitemap.ts` — 존재 여부
5. `src/app/robots.ts` — 존재 여부
6. `src/app/opengraph-image.*` / `src/app/twitter-image.*` — OG 이미지
7. `public/` — favicon, manifest 등
8. `src/components/` — heading(`h1`~`h6`), `<img>`, `next/image` 사용 현황 (시맨틱 구조 점검용)

## Step 2. 점검 항목

### 2-1. 메타 태그 & 문서 헤드 (2점)

| 항목 | 확인 내용 |
|------|----------|
| title | 각 페이지에 고유한 title이 있는가 |
| description | 각 페이지에 description이 있는가 (80~160자 권장) |
| 루트 metadata | `metadataBase` URL이 설정되어 있는가 |
| favicon | `icons` 설정이 적절한가 (svg/png, apple-touch-icon) |

### 2-2. Open Graph & 소셜 미디어 (1.5점)

| 항목 | 확인 내용 |
|------|----------|
| og:title / og:description | openGraph 필드가 metadata에 포함되어 있는가 |
| og:image | OG 이미지가 설정되어 있는가 (1200×630 권장) |
| og:type | website / article 등 적절한 타입인가 |
| twitter:card | Twitter Card 메타가 설정되어 있는가 |

### 2-3. 시맨틱 HTML & 접근성 (2점)

| 항목 | 확인 내용 | 심각도 |
|------|----------|--------|
| h1 태그 | 각 페이지에 h1이 1개 있는가 | 경고 |
| heading 논리 구조 | heading이 콘텐츠의 논리적 구조를 반영하는가 (level skip은 감점 대상이 아님, 스타일링 목적의 heading 남용만 감점) | 권장 |
| img alt | 모든 `<img>`, `next/image`에 alt가 있는가 | 경고 |
| 시맨틱 태그 | `<main>`, `<nav>`, `<section>`, `<article>` 적절히 사용하는가 | 권장 |
| lang 속성 | `<html lang="ko">` 설정되어 있는가 | 경고 |

### 2-4. 기술적 SEO (2점)

| 항목 | 확인 내용 |
|------|----------|
| sitemap | `src/app/sitemap.ts` 존재 및 올바른 URL 생성 |
| robots | `src/app/robots.ts` 존재 및 적절한 규칙 |
| canonical URL | 루트 `layout.tsx`에 `metadataBase`가 설정되어 있는가 |
| URL 구조 | kebab-case, 깔끔한 slug |

### 2-5. 성능 & Core Web Vitals (1.5점)

| 항목 | 확인 내용 |
|------|----------|
| next/image | `<img>` 대신 `next/image` 사용 여부 |
| priority | LCP 후보 이미지에 `priority` 속성이 있는가 |
| loading | 스크롤 아래 이미지에 lazy loading 적용 여부 |
| 폰트 최적화 | `next/font` 또는 `font-display: swap` 적용 여부 |
| INP 우려 요소 | 무거운 이벤트 핸들러, 불필요한 리렌더링, 메인 스레드 블로킹 등 INP에 영향을 줄 수 있는 패턴이 있는가 |

### 2-6. 구조화 데이터 (1점)

| 항목 | 확인 내용 |
|------|----------|
| JSON-LD | schema.org 구현 여부 |
| 적절성 | 사이트 성격에 맞는 타입 사용 |

### 2-7. E-E-A-T & 콘텐츠 신뢰 신호 (보너스, 0.5점)

| 항목 | 확인 내용 |
|------|----------|
| 저자 정보 | 콘텐츠에 저자/팀 정보가 표시되는가 (`ProfilePage`, `Author` 스키마 활용 가능) |
| 연락처 / About 페이지 | 사이트 운영자 정보가 접근 가능한가 |
| 날짜 정보 | 콘텐츠에 작성일/수정일이 표시되는가 |

## Step 3. 채점 (10점 만점 + 보너스 0.5점)

**감점 기준:**
- 치명적 이슈 (title 누락, lang 속성 없음): 각 -0.5점
- 경고 이슈 (description 너무 짧음, alt 누락, h1 없음): 각 -0.3점
- 권장 이슈 (OG 이미지 없음, sitemap 없음, 구조화 데이터 미구현, heading 구조 개선): 각 -0.2점


## Step 4. 리포트 출력

[template.md](template.md) 형식에 맞춰 리포트를 출력합니다.

## Step 5. 수정 제안

리포트 출력 후, 사용자에게 수정 여부를 확인합니다.
승인 시 치명적 이슈부터 우선 수정합니다.

**수정 범위 제한:**
- metadata 추가/수정만 직접 수행
- 구조화 데이터(JSON-LD) 추가는 직접 수행
- sitemap.ts / robots.ts 생성은 직접 수행
- 컴포넌트 구조 변경(시맨틱 태그 교체 등)은 제안만 하고 사용자 확인 후 수행
