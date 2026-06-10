# ADR-001: React Compiler 활성화 + `forwardRef` 금지

- **status**: accepted
- **date**: 2026-XX-XX
- **참여자**: @미정
- **관련**: [[../../기획/프로젝트-개요]]

## 맥락

React 19와 React Compiler가 출시되면서 `useMemo`, `useCallback`, `React.memo`가 대부분의 경우 불필요해졌다. 또한 React 19에서는 `ref`가 일반 prop으로 전달되어 `forwardRef`가 더 이상 필요 없다.

## 결정

1. `next.config.ts`에 `reactCompiler: true` 활성화.
2. `useMemo`/`useCallback`/`React.memo`는 측정으로 필요성이 증명된 경우에만 사용.
3. **`forwardRef` 사용 금지** — 발견하면 즉시 리팩터링.
4. 공유 UI 컴포넌트는 props 인터페이스에 `ref?: React.Ref<T>`를 노출.

## 이유

- React Compiler가 자동 메모이제이션을 해주므로 수동 최적화 코드가 노이즈가 됨.
- `forwardRef`는 타입이 복잡하고 React 19에선 불필요.
- 코드베이스 일관성을 위해 _강제_ 규칙으로 둠.

## 대안 / 트레이드오프

- React Compiler가 아직 일부 패턴에서 베타적. → 발견 시 ADR로 예외 기록.

## 영향

- `.claude/rules/component-guide.md`에 패턴 반영됨.
- CLAUDE.md에도 명시됨.
