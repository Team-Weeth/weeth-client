'use client';

import { useEffect, useRef } from 'react';

import type { DeepPartial, FieldValues, UseFormWatch } from 'react-hook-form';

/**
 * react-hook-form의 값 변경을 외부 스토어(zustand 등)에 동기화하는 훅.
 *
 * persist/새로고침 복원을 위해 폼 입력값을 계속 store에 반영해야 하는
 * 온보딩 스텝들에서 공통으로 사용한다. store는 소스가 아니라 미러이며,
 * `watch` 구독은 마운트당 1회만 등록하고 최신 `onChange`는 ref로 참조한다.
 *
 * @param watch    useForm이 반환한 watch 함수
 * @param onChange 변경된 폼 값을 받아 store에 반영하는 콜백
 */
function useSyncFormToStore<T extends FieldValues>(
  watch: UseFormWatch<T>,
  onChange: (values: DeepPartial<T>) => void,
) {
  // 최신 onChange를 ref로 참조(구독은 마운트당 1회만 등록). 렌더 중 ref 변경 금지 규칙에 맞춰 effect에서 갱신한다.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    const subscription = watch((values) => onChangeRef.current(values as DeepPartial<T>));
    return () => subscription.unsubscribe();
  }, [watch]);
}

export { useSyncFormToStore };
