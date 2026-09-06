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

/** "1, 2, 3" 중 가장 최근(가장 큰) 기수 번호. 유효한 기수가 없으면 0. */
function getLatestCardinalNumber(cardinal: string) {
  return Math.max(...parseCardinals(cardinal).map(getCardinalNumber), 0);
}

export {
  compareCardinalDesc,
  formatCardinalLabel,
  getCardinalNumber,
  getLatestCardinalNumber,
  getVisibleMemberCardinals,
};
