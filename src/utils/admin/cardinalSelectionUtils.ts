function getCommonCardinals(memberCardinals: number[][]) {
  if (memberCardinals.length === 0) return [];
  const counts = getCardinalCounts(memberCardinals);
  return [...counts.entries()]
    .filter(([, count]) => count === memberCardinals.length)
    .map(([cardinal]) => cardinal);
}

function getPartialCardinals(memberCardinals: number[][], memberCount: number) {
  const counts = getCardinalCounts(memberCardinals);
  const total = memberCardinals.length || memberCount;
  return new Set(
    [...counts.entries()]
      .filter(([, count]) => count > 0 && count < total)
      .map(([cardinal]) => cardinal),
  );
}

function isEveryCardinalSelected(availableCardinals: number[], selected: Set<number>) {
  return (
    availableCardinals.length > 0 && availableCardinals.every((cardinal) => selected.has(cardinal))
  );
}

function getCardinalCounts(memberCardinals: number[][]) {
  return memberCardinals.reduce((acc, cardinals) => {
    new Set(cardinals).forEach((cardinal) => {
      acc.set(cardinal, (acc.get(cardinal) ?? 0) + 1);
    });
    return acc;
  }, new Map<number, number>());
}

export { getCommonCardinals, getPartialCardinals, isEveryCardinalSelected };
