function usePaginationWindow(currentPage: number, totalPages: number, windowSize = 5): number[] {
  const start = Math.max(
    1,
    Math.min(currentPage - Math.floor(windowSize / 2), totalPages - windowSize + 1),
  );
  const end = Math.min(totalPages, start + windowSize - 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export { usePaginationWindow };
