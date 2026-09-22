/** 해당 노드를 실제로 스크롤하는 가장 가까운 조상. 없으면 null. */
export function findScrollContainer(node: HTMLElement | null): HTMLElement | null {
  for (let element = node; element; element = element.parentElement) {
    const { overflowX, overflowY } = getComputedStyle(element);
    if (/auto|scroll/.test(`${overflowX} ${overflowY}`)) return element;
  }
  return null;
}
