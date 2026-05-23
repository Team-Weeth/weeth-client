type QRStatus = 'qr-none' | 'qr-open' | 'qr-close' | null;

type SSEStateUpdate =
  | { kind: 'status'; status: Exclude<QRStatus, null>; expiredAt: string | null }
  | { kind: 'expiry'; expiredAt: string };

interface ParseSSEResult {
  remaining: string;
  currentEvent: string;
  updates: SSEStateUpdate[];
  resetRetry: boolean;
}

function parseSSEText(text: string, buffer: string, currentEvent: string): ParseSSEResult {
  const combined = buffer + text;
  const lines = combined.split(/\r?\n/);
  const remaining = lines.pop() ?? '';
  const updates: SSEStateUpdate[] = [];
  let resetRetry = false;

  for (const line of lines) {
    if (line.startsWith('event:')) {
      currentEvent = line.slice(6).trim();
      continue;
    }

    // 빈 줄 = 이벤트 경계
    if (line === '') {
      currentEvent = '';
      continue;
    }

    if (!line.startsWith('data:')) continue;

    const jsonStr = line.slice(5).trim();
    if (!jsonStr) continue;

    try {
      const parsed = JSON.parse(jsonStr) as { expiredAt?: string } | null;
      const eventType = currentEvent as Exclude<QRStatus, null> | '';

      if (eventType === 'qr-open' && parsed?.expiredAt) {
        updates.push({ kind: 'status', status: 'qr-open', expiredAt: parsed.expiredAt });
      } else if (eventType === 'qr-none') {
        updates.push({ kind: 'status', status: 'qr-none', expiredAt: null });
      } else if (eventType === 'qr-close') {
        updates.push({ kind: 'status', status: 'qr-close', expiredAt: null });
      } else if (parsed?.expiredAt) {
        updates.push({ kind: 'expiry', expiredAt: parsed.expiredAt });
      }

      resetRetry = true;
      currentEvent = '';
    } catch {
      // ignore parse errors
    }
  }

  return { remaining, currentEvent, updates, resetRetry };
}

export { parseSSEText, type QRStatus, type SSEStateUpdate, type ParseSSEResult };
