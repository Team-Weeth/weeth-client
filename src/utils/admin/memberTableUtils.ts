import { parseCardinals } from './parseCardinals';

const VISIBLE_CARDINAL_LIMIT = 2;

function getVisibleMemberCardinals(cardinal: string) {
  const cardinals = parseCardinals(cardinal).sort(compareCardinalDesc);
  const visibleCardinals = cardinals.slice(0, VISIBLE_CARDINAL_LIMIT);
  const hiddenCardinals = cardinals.slice(VISIBLE_CARDINAL_LIMIT);

  return {
    visibleCardinals,
    hiddenCardinals,
    hiddenCardinalCount: hiddenCardinals.length,
  };
}

function formatCardinalLabel(cardinal: string) {
  return cardinal.endsWith('기') ? cardinal : `${cardinal}기`;
}

function compareCardinalDesc(a: string, b: string) {
  return getCardinalNumber(b) - getCardinalNumber(a);
}

function getCardinalNumber(cardinal: string) {
  return Number(cardinal.replace('기', '')) || 0;
}

export { compareCardinalDesc, formatCardinalLabel, getVisibleMemberCardinals };
