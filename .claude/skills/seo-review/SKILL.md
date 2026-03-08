---
name: seo-review
description: Reviews the project's SEO status and generates an improvement report. Use for SEO review requests. If a specific path is given, review only that path; otherwise review all of src/app/.
argument-hint: "[path]"
---

Also check `src/components/` for semantic structure (headings, img, etc.).

## Project Context

- Next.js 16 App Router (React 19)
- `layout.tsx` uses `export const metadata` or `generateMetadata()`
- Root layout: `src/app/layout.tsx`
- Route Groups: `(public)` landing/auth, `(private)` post-login pages
- Korean single language (`lang="ko"`)

## Step 1. Collect Current State

Read the following files to assess SEO status:

1. `src/app/layout.tsx` — root metadata
2. Each route group's `layout.tsx` — nested metadata
3. Each `page.tsx` — per-page metadata / generateMetadata
4. `src/app/sitemap.ts` — existence check
5. `src/app/robots.ts` — existence check
6. `src/app/opengraph-image.*` / `src/app/twitter-image.*` — OG images
7. `public/` — favicon, manifest, etc.
8. `src/components/` — heading (`h1`~`h6`), `<img>`, `next/image` usage (semantic structure check)

## Step 2. Checklist

### 2-1. Meta Tags & Document Head (2pts)

| Item | Check |
|------|-------|
| title | Unique title per page |
| description | Description per page (80~160 chars recommended) |
| root metadata | `metadataBase` URL configured |
| favicon | Proper `icons` setup (svg/png, apple-touch-icon) |

### 2-2. Open Graph & Social Media (1.5pts)

| Item | Check |
|------|-------|
| og:title / og:description | openGraph fields in metadata |
| og:image | OG image set (1200×630 recommended) |
| og:type | Appropriate type (website / article) |
| twitter:card | Twitter Card meta configured |

### 2-3. Semantic HTML & Accessibility (2pts)

| Item | Check | Severity |
|------|-------|----------|
| h1 tag | Exactly one h1 per page | warning |
| heading structure | Headings reflect logical content structure (level skip is NOT penalized; only penalize heading misuse for styling) | suggestion |
| img alt | All `<img>`, `next/image` have alt | warning |
| semantic tags | Proper use of `<main>`, `<nav>`, `<section>`, `<article>` | suggestion |
| lang attribute | `<html lang="ko">` set | warning |

### 2-4. Technical SEO (2pts)

| Item | Check |
|------|-------|
| sitemap | `src/app/sitemap.ts` exists with correct URLs |
| robots | `src/app/robots.ts` exists with proper rules |
| canonical URL | `metadataBase` set in root `layout.tsx` |
| URL structure | kebab-case, clean slugs |

### 2-5. Performance & Core Web Vitals (1.5pts)

| Item | Check |
|------|-------|
| next/image | Using `next/image` instead of `<img>` |
| priority | `priority` on LCP candidate images |
| loading | Lazy loading for below-fold images |
| font optimization | `next/font` or `font-display: swap` |
| INP concerns | Heavy event handlers, unnecessary re-renders, main thread blocking patterns |

### 2-6. Structured Data (1pt)

| Item | Check |
|------|-------|
| JSON-LD | schema.org implementation |
| relevance | Appropriate type for the site |

### 2-7. E-E-A-T & Content Trust Signals (bonus, 0.5pts)

| Item | Check |
|------|-------|
| author info | Author/team info displayed (`ProfilePage`, `Author` schema) |
| contact / about | Operator info accessible |
| date info | Publish/update dates displayed |

## Step 3. Scoring (10pts + 0.5 bonus)

**Deduction criteria:**
- Critical (missing title, no lang attribute): -0.5 each
- Warning (short description, missing alt, no h1): -0.3 each
- Suggestion (no OG image, no sitemap, no structured data, heading structure improvement): -0.2 each

## Step 4. Report

Output report following [template.md](template.md) format.

## Step 5. Fix Suggestions

After report output, confirm with user whether to apply fixes.
If approved, fix critical issues first.

**Fix scope:**
- Directly apply: metadata add/edit, JSON-LD, sitemap.ts / robots.ts creation
- Propose only (confirm before applying): component structure changes (semantic tag replacements, etc.)
