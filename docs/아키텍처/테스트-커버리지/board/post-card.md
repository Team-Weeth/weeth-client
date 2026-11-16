# 테스트 커버리지 — PostCard

`src/components/board/PostCard/` 하위 파일의 단위 테스트 커버리지를 기록한다.

---

## PostCardBody (`src/components/board/PostCard/PostCardBody.tsx`)

**측정일**: 2026-10-31
**테스트 파일**: `src/components/board/PostCard/__tests__/PostCardBody.test.tsx`
**총 테스트 수**: 11개

### 파일별 커버리지

| 파일 | Statements | Branches | Functions | Lines |
|------|-----------|---------|---------|-------|
| `PostCardBody.tsx` | **100%** | 76.19% | **100%** | **100%** |

### 테스트 구성

#### `PostCardBody.test.tsx` (11개)

sanitized HTML 렌더링, 이미지 클릭 시 풀스크린 뷰어 전환, alt 자동 보정 useEffect, expandable 접기/펼치기 동작 검증.

**모킹 전략**

| 모킹 대상 | 이유 |
|-----------|------|
| `isomorphic-dompurify` | DOMPurify 결과를 입력 그대로 반환해 HTML 예측 가능하게 고정 |
| `@/hooks/useLineClamp` | jsdom에서 scrollHeight/clientHeight가 0이라 `isClamped` 제어 불가. `React.createRef()`를 포함한 mock으로 DOM 참조 유지 |
| `@/components/ui/FullscreenImageViewer` | 무거운 Radix Dialog + 다수 훅 의존성 제거 |

| 케이스 | 검증 내용 |
|--------|---------|
| 스모크 | 크래시 없이 렌더링 |
| 이미지 클릭 → 뷰어 열림 | 클릭 시 `data-testid="image-viewer"` 노출 |
| 비이미지 요소 클릭 | 뷰어 열리지 않음 |
| 여러 이미지 중 두 번째 클릭 | 뷰어가 열림 (인덱스 확인) |
| alt 없는 img | useEffect 후 `alt=""` 추가됨 |
| alt 있는 img | 기존 alt 유지 |
| expandable 미지정 | 이어서 보기 버튼 없음 |
| expandable + isClamped | 이어서 보기 버튼 표시 |
| expandable + isClamped=false | 이어서 보기 버튼 없음 |
| 이어서 보기 클릭 | `setIsExpanded(true)` 호출 |
| isExpanded=true | 이어서 보기 버튼 사라짐 |

### 미커버 분기

| 라인 | 내용 | 이유 |
|------|------|------|
| 43 | `if (!ref.current) return` (alt useEffect) | 마운트된 컴포넌트에서는 ref가 항상 설정됨. 방어 코드 |
| 57–58 | `if (!src) return` / `if (!ref.current) return` (handleClick) | `img[src]` 셀렉터로 찾은 요소는 src가 반드시 존재. 방어 코드 |
| 63 | `el.getAttribute('alt') ?? undefined` (null 분기) | alt 속성 보정 useEffect 이후 null이 남지 않음 |
| 67 | `if (index === -1) return` | 같은 DOM에서 추출한 src이므로 -1 불가. 방어 코드 |
