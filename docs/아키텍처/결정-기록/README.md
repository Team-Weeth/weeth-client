# ADR (Architecture Decision Records)

"왜 그렇게 결정했는가"를 남기는 곳. 코드는 _무엇을_ 했는지 보여주지만, _왜_ 했는지는 못 보여준다. 그 공백을 ADR이 메운다.

## 언제 쓰나

- 라이브러리/프레임워크 선택 (예: TanStack Query vs SWR)
- 패턴 강제 (예: forwardRef 금지, pnpm 전용)
- 데이터 모델 결정 (예: 댓글을 별도 테이블로)
- 되돌리기 어려운 결정 전반

## 어떻게 쓰나

1. [[../../템플릿/ADR-템플릿]] 복사
2. 파일명: `ADR-{번호}-{슬러그}.md` (예: `ADR-004-tiptap-extensions.md`)
3. 결정되면 status를 `accepted`로
4. 나중에 뒤집히면 새 ADR 만들고 옛 ADR을 `superseded`로 표시 (지우지 않는다)

## 목록

- [[ADR-001-react-compiler]] — React Compiler 켜고 `forwardRef` 금지
- [[ADR-002-data-fetching-strategy]] — RSC / Server Action / React Query 사용 기준
- [[ADR-003-zustand-pattern]] — combine + devtools + 셀렉터 훅 강제

## ADR 후보 (작성 대기)

아래는 코드/규칙에 이미 박혀있지만 아직 ADR로 정리되지 않은 결정들. 시간 날 때 하나씩 채워간다.

- [ ] pnpm 전용 (npm/yarn 금지) — 락파일 충돌 방지
- [ ] 디자인 토큰 강제 (하드코딩 금지)
- [ ] cva + cn() 컴포넌트 패턴
- [ ] 쿠키 기반 인증 (accessToken/refreshToken)
- [ ] `lib/apis` 배럴 임포트 금지 (클라이언트 측 빌드 깨짐)
- [ ] tiptap 2.4.0 선택 이유
- [ ] Suspense + `useSuspenseQuery` + `loading.tsx`/`error.tsx` 패턴
