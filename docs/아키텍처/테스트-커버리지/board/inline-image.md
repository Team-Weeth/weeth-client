# 테스트 커버리지 — Board › 인라인 이미지

`src/components/board/Editor/extensions/` 하위 인라인 이미지 관련 유틸리티 및 훅의 단위 테스트 커버리지를 기록한다.

---

## 인라인 이미지 유틸리티 + 뷰어·레이아웃·서브선택 훅

**측정일**: 2026-10-05
**테스트 파일**: `src/components/board/Editor/extensions/__tests__/`, `src/components/board/Editor/extensions/ImageGroup/__tests__/`
**총 테스트 수**: 32개 (imageDocUtils 8개 + useAdjacentNodes 6개 + useJustifiedLayout 8개 + useSubSelection 10개)

### 파일별 커버리지

| 파일 | Statements | Branches | Functions | Lines |
|------|-----------|---------|---------|-------|
| `imageDocUtils.ts` | **100%** | **100%** | **100%** | **100%** |
| `useAdjacentNodes.ts` | **100%** | **100%** | **100%** | **100%** |
| `useJustifiedLayout.ts` | **100%** | **95.23%** | **100%** | **100%** |
| `useSubSelection.ts` | **100%** | **100%** | **100%** | **100%** |

### 테스트 구성

#### `imageDocUtils.test.ts` (8개)

ProseMirror 문서를 순회해 전체 이미지 목록과 클릭된 이미지 인덱스를 계산하는 `collectDocImages` 순수 유틸리티.

| 케이스 | 검증 내용 |
|--------|---------|
| 빈 문서 | `images=[]`, `clickedIndex=0` |
| 단일 inlineImage 클릭 | `clickedIndex=0`, src/alt 포함 |
| 두 번째 inlineImage 클릭 | `clickedIndex=1` |
| alt=null | 결과 객체의 `alt`가 `undefined` |
| imageGroup 첫 번째 이미지 클릭 | `clickedIndex=0`, 전체 그룹 이미지 포함 |
| imageGroup 두 번째 이미지 클릭 | `clickedIndex=1`, alt 전달 |
| 혼합: inlineImage 뒤 imageGroup 두 번째 클릭 | `clickedIndex=2` (인라인 1장 오프셋) |
| 혼합: imageGroup 뒤 inlineImage 클릭 | `clickedIndex=2` (그룹 2장 오프셋) |

#### `useAdjacentNodes.test.ts` (6개)

ProseMirror 노드뷰에서 이전/다음 형제 노드를 추적하는 훅. `editor.on("update")` 구독으로 실시간 갱신.

| 케이스 | 검증 내용 |
|--------|---------|
| 초기값 반환 | 마운트 즉시 `nodeBefore`/`nodeAfter` 계산 |
| `"update"` 이벤트 구독 및 상태 갱신 | 트리거 후 최신 값 반영 |
| 언마운트 시 `editor.off` 호출 | 리스너 정리 |
| 참조 안정성 | 값 불변 시 동일 객체 참조 유지 |
| `afterPos` 초과 | `docSize < pos + nodeSize` → `nodeAfter=null` |
| `getPos()` 예외 | try/catch로 `{ nodeBefore: null, nodeAfter: null }` 반환 |

#### `useJustifiedLayout.test.ts` (8개)

이미지 비율 기반 justified 레이아웃 계산 훅. JSDOM에 없는 `ResizeObserver`를 직접 모킹해 컨테이너 너비 이벤트를 수동 트리거.

| 케이스 | 검증 내용 |
|--------|---------|
| 초기 상태 | `targetH=null`, `cellWidths=null` |
| 모든 치수 로드 + 컨테이너 너비 확정 | `(containerWidth - READ_ONLY_GAP*(N-1)) / aspectSum` 계산 |
| 편집 모드 overhead | `DROP_ZONE_WIDTH * (N+1)` |
| 편집 모드 cellWidth | `targetH * (w/h) + DROP_ZONE_WIDTH` |
| 중복 src 재등록 | 두 번째 호출 무시, 첫 번째 치수 기준 유지 |
| `naturalWidth=0` | 치수 미등록 → `cellWidths=null` |
| `ResizeObserver` 미트리거 | `targetH=null` |
| 언마운트 | `ResizeObserver.disconnect` 호출 |

#### `useSubSelection.test.ts` (10개)

이미지 그룹 내 서브 선택(더블클릭) 상태 관리 훅.

| 케이스 | 검증 내용 |
|--------|---------|
| 초기 상태 | `subSelectedIdx=null` |
| 편집 모드 더블클릭 | 해당 `idx`로 설정 |
| 읽기 전용 더블클릭 | 상태 변경 없음 |
| `stopPropagation` 호출 | 이벤트 전파 차단 |
| `handleContainerClick` — `[data-group-image]` 클릭 | 기존 선택 유지 |
| `handleContainerClick` — 외부 클릭 | `null`로 초기화 |
| 컨테이너 바깥 `mousedown` | `null`로 초기화 |
| 컨테이너 내부 `mousedown` | 선택 유지 |
| `setSubSelectedIdx(n)` | 직접 idx 설정 |
| `setSubSelectedIdx(null)` | 선택 해제 |

### 미커버 브랜치

| 파일 | 라인 | 내용 | 이유 |
|-----|------|------|------|
| `useJustifiedLayout.ts` | — | `handleImageDimLoad`의 일부 엣지 케이스 | 4.77% 미커버; 모든 주요 경로는 테스트됨 |
