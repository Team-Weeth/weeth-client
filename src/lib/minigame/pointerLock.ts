/** 포인터 락을 건다. 지원하지 않거나 거부되면(헤드리스·iframe 등) 조용히 드래그 조작으로 남는다. */
export function lockPointer(element: HTMLElement | null | undefined) {
  try {
    const result = element?.requestPointerLock?.() as Promise<void> | undefined;
    result?.catch?.(() => undefined);
  } catch {
    /* 포인터 락을 쓸 수 없는 환경 */
  }
}
