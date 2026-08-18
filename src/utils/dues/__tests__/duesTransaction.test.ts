import {
  createDuesSummaryTransaction,
  getReceiptFiles,
  getReceiptUrls,
  getTransactionCounts,
  isPdfReceipt,
  mapApiTransactionDetailToDuesTransaction,
  mapApiTransactionToDuesTransaction,
  mergeTransactionCounts,
  sortDuesTransactions,
} from '@/utils/dues/duesTransaction';
import type {
  DuesReceiptFile,
  DuesTransaction,
  DuesTransactionApiItem,
  DuesTransactionDetailResponse,
} from '@/types/dues';

function createApiItem(overrides: Partial<DuesTransactionApiItem> = {}): DuesTransactionApiItem {
  return {
    transactionId: 1,
    type: 'INCOME',
    direction: 'INCOME',
    title: '거래 제목',
    source: null,
    amount: 10000,
    transactedAt: '2025-01-15T10:00:00',
    hasReceipt: false,
    ...overrides,
  };
}

function createDetail(
  overrides: Partial<DuesTransactionDetailResponse> = {},
): DuesTransactionDetailResponse {
  return {
    ...createApiItem(),
    category: null,
    registeredByName: null,
    memo: null,
    receipts: [],
    ...overrides,
  };
}

function createReceipt(overrides: Partial<DuesReceiptFile> = {}): DuesReceiptFile {
  return {
    fileId: 1,
    fileName: 'receipt.jpg',
    fileUrl: 'https://cdn.weeth.com/receipt.jpg',
    storageKey: 'storage-key',
    fileSize: 1000,
    contentType: 'image/jpeg',
    status: 'UPLOADED',
    ...overrides,
  };
}

function createTransaction(overrides: Partial<DuesTransaction> = {}): DuesTransaction {
  return {
    id: 1,
    type: 'income',
    title: '거래 제목',
    description: '기타',
    amount: 10000,
    date: '2025-01-15',
    ...overrides,
  };
}

describe('mapApiTransactionToDuesTransaction', () => {
  it('type이 DUES면 화면 타입 dues로 매핑한다', () => {
    const result = mapApiTransactionToDuesTransaction(createApiItem({ type: 'DUES' }));
    expect(result.type).toBe('dues');
  });

  it('DUES가 아니고 direction이 INCOME이면 income으로 매핑한다', () => {
    const result = mapApiTransactionToDuesTransaction(
      createApiItem({ type: 'INCOME', direction: 'INCOME' }),
    );
    expect(result.type).toBe('income');
  });

  it('DUES가 아니고 direction이 EXPENSE면 expense로 매핑한다', () => {
    const result = mapApiTransactionToDuesTransaction(
      createApiItem({ type: 'EXPENSE', direction: 'EXPENSE' }),
    );
    expect(result.type).toBe('expense');
  });

  it('transactedAt에서 날짜(T 앞부분)만 잘라 date로 사용한다', () => {
    const result = mapApiTransactionToDuesTransaction(
      createApiItem({ transactedAt: '2025-03-20T23:59:59' }),
    );
    expect(result.date).toBe('2025-03-20');
  });

  it('source가 있으면 description과 counterparty에 source를 쓴다', () => {
    const result = mapApiTransactionToDuesTransaction(createApiItem({ source: '김위드' }));
    expect(result.description).toBe('김위드');
    expect(result.counterparty).toBe('김위드');
  });

  it('source가 없고 type이 CARRY_OVER면 description을 "이월"로 채운다', () => {
    const result = mapApiTransactionToDuesTransaction(
      createApiItem({ source: null, type: 'CARRY_OVER' }),
    );
    expect(result.description).toBe('이월');
    expect(result.counterparty).toBeUndefined();
  });

  it('source가 없고 CARRY_OVER도 아니면 description을 "기타"로 채운다', () => {
    const result = mapApiTransactionToDuesTransaction(
      createApiItem({ source: null, type: 'INCOME' }),
    );
    expect(result.description).toBe('기타');
  });
});

describe('mapApiTransactionDetailToDuesTransaction', () => {
  it('source > memo > fallback 순으로 description을 선택한다', () => {
    const withSource = mapApiTransactionDetailToDuesTransaction(
      createDetail({ source: '스타벅스', memo: '팀 회식' }),
    );
    const withMemo = mapApiTransactionDetailToDuesTransaction(
      createDetail({ source: null, memo: '팀 회식' }),
    );
    const withFallback = mapApiTransactionDetailToDuesTransaction(
      createDetail({ source: null, memo: null, type: 'INCOME' }),
    );

    expect(withSource.description).toBe('스타벅스');
    expect(withMemo.description).toBe('팀 회식');
    expect(withFallback.description).toBe('기타');
  });

  it('registeredByName을 registrant로 매핑하고, 없으면 undefined다', () => {
    const withName = mapApiTransactionDetailToDuesTransaction(
      createDetail({ registeredByName: '관리자' }),
    );
    const withoutName = mapApiTransactionDetailToDuesTransaction(
      createDetail({ registeredByName: null }),
    );

    expect(withName.registrant).toBe('관리자');
    expect(withoutName.registrant).toBeUndefined();
  });

  it('UPLOADED 상태의 영수증만 남기고 receiptUrls를 만든다', () => {
    const result = mapApiTransactionDetailToDuesTransaction(
      createDetail({
        receipts: [
          createReceipt({ fileId: 1, fileUrl: 'a.jpg', status: 'UPLOADED' }),
          createReceipt({ fileId: 2, fileUrl: 'b.jpg', status: 'DELETED' }),
          createReceipt({ fileId: 3, fileUrl: 'c.jpg', status: 'UPLOADED' }),
        ],
      }),
    );

    expect(result.receipts).toHaveLength(2);
    expect(result.receiptUrls).toEqual(['a.jpg', 'c.jpg']);
    expect(result.receiptThumbnailUrl).toBe('a.jpg');
  });

  it('업로드된 영수증이 없으면 썸네일이 undefined다', () => {
    const result = mapApiTransactionDetailToDuesTransaction(createDetail({ receipts: [] }));
    expect(result.receiptThumbnailUrl).toBeUndefined();
  });
});

describe('createDuesSummaryTransaction', () => {
  it('duesSummary가 null이면 null을 반환한다', () => {
    expect(createDuesSummaryTransaction(null)).toBeNull();
  });

  it('요약 거래를 id -1, type dues, 빈 날짜로 생성한다', () => {
    const result = createDuesSummaryTransaction({
      label: '회비 납부 내역',
      totalAmount: 300000,
      description: '총 6명 납부',
    });

    expect(result).toEqual({
      id: -1,
      type: 'dues',
      title: '회비 납부 내역',
      description: '총 6명 납부',
      amount: 300000,
      date: '',
    });
  });
});

describe('getTransactionCounts', () => {
  it('타입별 거래 개수와 전체 개수를 집계한다', () => {
    const transactions = [
      createTransaction({ id: 1, type: 'income' }),
      createTransaction({ id: 2, type: 'expense' }),
      createTransaction({ id: 3, type: 'expense' }),
      createTransaction({ id: 4, type: 'dues' }),
    ];

    expect(getTransactionCounts(transactions)).toEqual({
      all: 4,
      income: 1,
      expense: 2,
      dues: 1,
    });
  });

  it('빈 배열이면 모든 값이 0이다', () => {
    expect(getTransactionCounts([])).toEqual({ all: 0, income: 0, expense: 0, dues: 0 });
  });
});

describe('mergeTransactionCounts', () => {
  const fallback = { all: 1, income: 1, expense: 0, dues: 0 };

  it('서버 counts가 있으면 그대로 사용한다', () => {
    const serverCounts = { all: 10, income: 4, expense: 3, dues: 3 };
    expect(mergeTransactionCounts(fallback, serverCounts)).toBe(serverCounts);
  });

  it('서버 counts가 없으면 fallback을 사용한다', () => {
    expect(mergeTransactionCounts(fallback, undefined)).toBe(fallback);
  });
});

describe('sortDuesTransactions', () => {
  it('요약 거래(id -1)를 항상 맨 앞에 둔다', () => {
    const sorted = sortDuesTransactions([
      createTransaction({ id: 5, type: 'income', date: '2025-05-01' }),
      createTransaction({ id: -1, type: 'dues', date: '' }),
    ]);
    expect(sorted[0].id).toBe(-1);
  });

  it('dues 타입을 다른 타입보다 앞에 둔다', () => {
    const sorted = sortDuesTransactions([
      createTransaction({ id: 1, type: 'income', date: '2025-05-01' }),
      createTransaction({ id: 2, type: 'dues', date: '2025-01-01' }),
    ]);
    expect(sorted[0].type).toBe('dues');
  });

  it('같은 타입이면 날짜 내림차순으로 정렬한다', () => {
    const sorted = sortDuesTransactions([
      createTransaction({ id: 1, type: 'income', date: '2025-01-10' }),
      createTransaction({ id: 2, type: 'income', date: '2025-03-10' }),
      createTransaction({ id: 3, type: 'income', date: '2025-02-10' }),
    ]);
    expect(sorted.map((t) => t.date)).toEqual(['2025-03-10', '2025-02-10', '2025-01-10']);
  });

  it('타입과 날짜가 같으면 id 내림차순으로 정렬한다', () => {
    const sorted = sortDuesTransactions([
      createTransaction({ id: 1, type: 'income', date: '2025-01-10' }),
      createTransaction({ id: 3, type: 'income', date: '2025-01-10' }),
      createTransaction({ id: 2, type: 'income', date: '2025-01-10' }),
    ]);
    expect(sorted.map((t) => t.id)).toEqual([3, 2, 1]);
  });

  it('원본 배열을 변경하지 않는다', () => {
    const original = [
      createTransaction({ id: 1, date: '2025-01-01' }),
      createTransaction({ id: 2, date: '2025-02-01' }),
    ];
    const originalOrder = original.map((t) => t.id);

    sortDuesTransactions(original);

    expect(original.map((t) => t.id)).toEqual(originalOrder);
  });
});

describe('getReceiptUrls', () => {
  it('receiptUrls가 있으면 그 배열을 사용한다', () => {
    const transaction = createTransaction({ receiptUrls: ['a.jpg', 'b.jpg'] });
    expect(getReceiptUrls(transaction)).toEqual(['a.jpg', 'b.jpg']);
  });

  it('receiptUrls가 없고 단일 receiptUrl이 있으면 배열로 감싼다', () => {
    const transaction = createTransaction({ receiptUrl: 'single.jpg' });
    expect(getReceiptUrls(transaction)).toEqual(['single.jpg']);
  });

  it('영수증이 전혀 없으면 빈 배열을 반환한다', () => {
    expect(getReceiptUrls(createTransaction())).toEqual([]);
  });

  it('빈 문자열 URL은 걸러낸다', () => {
    const transaction = createTransaction({ receiptUrls: ['a.jpg', '', 'b.jpg'] });
    expect(getReceiptUrls(transaction)).toEqual(['a.jpg', 'b.jpg']);
  });
});

describe('getReceiptFiles', () => {
  it('receipts가 있으면 UPLOADED 상태만 반환한다', () => {
    const transaction = createTransaction({
      receipts: [
        createReceipt({ fileId: 1, status: 'UPLOADED' }),
        createReceipt({ fileId: 2, status: 'PENDING' }),
      ],
    });

    const files = getReceiptFiles(transaction);
    expect(files).toHaveLength(1);
    expect(files[0].fileId).toBe(1);
  });

  it('receipts가 없으면 receiptUrls를 파일 객체로 변환한다', () => {
    const transaction = createTransaction({ receiptUrls: ['x.jpg', 'y.jpg'] });

    const files = getReceiptFiles(transaction);
    expect(files).toHaveLength(2);
    expect(files[0]).toMatchObject({
      fileId: 0,
      fileName: 'receipt-1',
      fileUrl: 'x.jpg',
      status: 'UPLOADED',
    });
  });
});

describe('isPdfReceipt', () => {
  it.each([
    ['contentType이 application/pdf', createReceipt({ contentType: 'application/pdf' }), true],
    ['파일명이 .pdf로 끝남(대문자 포함)', createReceipt({ fileName: 'RECEIPT.PDF' }), true],
    ['URL에 .pdf가 포함됨', createReceipt({ fileUrl: 'https://cdn/doc.PDF?v=1' }), true],
    ['이미지 영수증', createReceipt({ contentType: 'image/png', fileName: 'a.png', fileUrl: 'a.png' }), false],
  ])('%s', (_label, receipt, expected) => {
    expect(isPdfReceipt(receipt)).toBe(expected);
  });
});
