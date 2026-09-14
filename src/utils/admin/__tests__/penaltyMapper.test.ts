import { toPenaltyRecord } from '../penaltyMapper';

describe('toPenaltyRecord', () => {
  it.each(['PENALTY', 'WARNING'] as const)('서버의 %s 유형을 유지한다', (penaltyType) => {
    expect(
      toPenaltyRecord({
        penaltyId: 1,
        penaltyType,
        score: penaltyType === 'WARNING' ? 0 : 1,
        penaltyDescription: '지각',
        time: '2026-09-13T09:00:00',
      }),
    ).toEqual({
      id: 1,
      type: penaltyType,
      score: penaltyType === 'WARNING' ? 0 : 1,
      reason: '지각',
      createdAt: '2026-09-13',
    });
  });
});
