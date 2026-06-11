'use server';

export interface OcrReceiptResult {
  amount?: string;
  vendor?: string;
  date?: string;
}

interface GoogleVisionResponse {
  responses: Array<{
    fullTextAnnotation?: { text: string };
    error?: { message: string };
  }>;
}

function parseReceiptText(lines: string[]): OcrReceiptResult {
  const fullText = lines.join('\n');
  const result: OcrReceiptResult = {};

  // 날짜: YYYY-MM-DD / YYYY.MM.DD / YYYY년 MM월 DD일 / YY-MM-DD 순으로 시도
  const datePatterns = [
    /(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/,
    /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/,
    /(\d{2})[.\-/](\d{1,2})[.\-/](\d{1,2})/,
  ];
  for (const re of datePatterns) {
    const m = fullText.match(re);
    if (m) {
      const year = m[1].length === 2 ? `20${m[1]}` : m[1];
      result.date = `${year}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
      break;
    }
  }

  // 금액: 합계/결제 키워드 근처 숫자 → 없으면 전체에서 가장 큰 숫자
  const amountKeywords = ['합계', '총액', '결제금액', '총합계', '결제', '금액'];
  outer: for (let i = 0; i < lines.length; i++) {
    if (amountKeywords.some((kw) => lines[i].includes(kw))) {
      for (let j = i; j <= Math.min(i + 2, lines.length - 1); j++) {
        const m = lines[j].match(/[\d,]+/);
        if (m) {
          const num = parseInt(m[0].replace(/,/g, ''));
          if (num >= 100) {
            result.amount = String(num);
            break outer;
          }
        }
      }
    }
  }
  if (!result.amount) {
    const nums = lines
      .flatMap((t) => [...t.matchAll(/[\d,]+/g)].map((m) => parseInt(m[0].replace(/,/g, ''))))
      .filter((n) => n >= 1000);
    if (nums.length) result.amount = String(Math.max(...nums));
  }

  // 거래처: 숫자·날짜·'영수증' 노이즈를 제외한 첫 의미 있는 텍스트
  result.vendor = lines
    .find(
      (t) =>
        t.trim().length >= 2 &&
        !/^[\d\s,.\-/]+$/.test(t) &&
        !/\d{4}년/.test(t) &&
        !/영수증|receipt/i.test(t),
    )
    ?.trim();

  return result;
}

export async function analyzeReceipt(formData: FormData): Promise<OcrReceiptResult> {
  const file = formData.get('image') as File | null;
  if (!file) throw new Error('이미지 파일이 없습니다.');

  const apiKey = process.env.GOOGLE_VISION_API_KEY;
  if (!apiKey) throw new Error('OCR 설정이 누락되었습니다. 환경 변수를 확인해주세요.');

  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');

  const res = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [
        {
          image: { content: base64 },
          features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
        },
      ],
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    throw new Error(`OCR API 오류 (${res.status}): ${errorBody}`);
  }

  const data: GoogleVisionResponse = await res.json();
  const response = data.responses?.[0];

  if (response?.error) throw new Error(`OCR 오류: ${response.error.message}`);

  const text = response?.fullTextAnnotation?.text;
  if (!text) throw new Error('영수증에서 텍스트를 인식하지 못했습니다. 이미지를 확인해주세요.');

  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  return parseReceiptText(lines);
}
