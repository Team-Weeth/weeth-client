import { parseCardinals } from './parseCardinals';

const VISIBLE_CARDINAL_LIMIT = 2;

function getVisibleMemberCardinals(cardinal: string) {
  const cardinals = parseCardinals(cardinal);

  return {
    visibleCardinals: cardinals.slice(0, VISIBLE_CARDINAL_LIMIT),
    hiddenCardinalCount: Math.max(cardinals.length - VISIBLE_CARDINAL_LIMIT, 0),
  };
}

function formatCardinalLabel(cardinal: string) {
  return cardinal.endsWith('기') ? cardinal : `${cardinal}기`;
}

export { formatCardinalLabel, getVisibleMemberCardinals };
