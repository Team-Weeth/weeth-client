# 번들 분석 사용법

> `@next/bundle-analyzer`로 빌드 결과물의 크기·구성을 시각적으로 확인한다.

## 실행

```bash
pnpm analyze
```

일반 `pnpm build`와 동일하게 빌드하되, 완료 후 아래 세 개의 HTML 리포트가 브라우저에서 자동으로 열린다.

| 리포트 | 내용 |
|--------|------|
| `client.html` | 브라우저에서 실행되는 번들 (가장 중요) |
| `server.html` | Node.js 서버 번들 |
| `edge.html` | Edge Runtime 번들 (미들웨어 등) |

리포트 파일은 `.next/analyze/` 에 저장된다.

---

## 읽는 법

화면의 각 사각형은 **하나의 모듈(파일)**이다.

- **크기** — 사각형이 클수록 번들 용량이 큼
- **색상** — 같은 색상은 같은 chunk에 속함
- **클릭** — 클릭하면 해당 모듈의 경로와 정확한 크기 확인 가능

### 주요 확인 포인트

1. **예상보다 큰 라이브러리** — 사용량 대비 크기가 지나치게 크면 동적 import(`dynamic()`) 검토
2. **중복 모듈** — 같은 라이브러리가 여러 chunk에 분산되어 있으면 `webpack.splitChunks` 설정 문제
3. **서버 번들에 클라이언트 코드가 포함** — `'use client'` 누락 또는 잘못된 import 경로가 원인
4. **node_modules 비율** — `node_modules` 영역이 지나치게 크면 barrel import(`@/lib/apis`) 등을 점검

---

## 흔한 문제와 대응

### 특정 라이브러리가 너무 클 때

```ts
// Before: 항상 로드됨
import HeavyComponent from '@/components/HeavyComponent';

// After: 필요할 때만 로드
import dynamic from 'next/dynamic';
const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'));
```

### 아이콘 라이브러리가 통째로 포함될 때

```ts
// Bad: 전체 번들 포함됨
import { Search } from 'lucide-react';

// Good: 동일하게 tree-shake 되지만, 배럴 임포트가 문제라면 직접 경로 사용
import Search from 'lucide-react/dist/esm/icons/search';
```

---

## CI에서 실행하지 않는 이유

`ANALYZE=true` 환경 변수가 없으면 analyzer가 비활성화되어 일반 빌드에 영향을 주지 않는다.
CI 파이프라인에는 `pnpm build`를 그대로 사용한다.
