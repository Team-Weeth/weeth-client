import { toPenaltyRecord } from '../penaltyMapper';

describe('toPenaltyRecord', () => {
  it.each(['PENALTY', 'WARNING'] as const)('서버의 %s 유형을 유지한다', (penaltyType) => {
    expect(
      toPenaltyRecord({
        penaltyId: 1,
        cardinal: 4,
        penaltyType,

        penaltyDescription: '지각',
        time: '2026-09-13T09:00:00',
      }),
    ).toEqual({
      id: 1,
      cardinal: 4,
      type: penaltyType,

      reason: '지각',
      createdAt: '2026-09-13',
    });
  });
});
