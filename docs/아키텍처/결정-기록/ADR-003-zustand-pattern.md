# ADR-003: Zustand는 combine + devtools + 셀렉터 훅 패턴

- **status**: accepted
- **date**: YYYY-MM-DD
- **참여자**: @미정
- **관련**: `.claude/rules/state-management.md`

## 맥락
Zustand는 자유도가 높아 사람마다 다른 스타일로 짠다. 일관성이 없으면 디버깅과 리렌더 추적이 어려워진다.

## 결정
모든 Zustand 스토어는 다음을 강제한다.

1. `initialState`를 별도 객체로 분리 → `reset` 액션에서 재사용.
2. `combine`으로 state와 actions 분리.
3. `devtools`로 감싸고 `name` 옵션 필수 (Redux DevTools 라벨).
4. 모든 `set()`의 세 번째 인자에 액션 이름 라벨 작성.
5. **컴포넌트에서 스토어 훅을 직접 쓰지 않는다.** 셀렉터 훅(`useValue`, `useCount` 등)을 스토어 파일에서 export하고 컴포넌트는 그것만 사용.
6. 액션들은 안정 참조라 `useXActions()` 하나로 묶어 export.
7. 파일명: `use{Name}Store.ts`.

## 이유
- 셀렉터 훅: 슬라이스만 구독 → 불필요한 리렌더 차단.
- devtools name: DevTools에서 어떤 스토어의 액션인지 즉시 식별.
- 액션 라벨: 액션 흐름 추적이 가능.
- combine + initialState 분리: `reset` 구현이 1줄.

## 영향
- 새 스토어는 `src/stores/use{Name}Store.ts` 위치.
- 스토어 추가 시 `src/stores/index.ts`에 export 등록.
- 기존 스토어 리팩터링 시 셀렉터 훅 누락된 곳을 같이 채운다.
