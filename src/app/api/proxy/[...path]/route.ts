import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_PATH } from '@/constants/api';
import { ACCESS_TOKEN_KEY } from '@/lib/apis/cookies';

// SSE 장기 연결 대응 (출석 시간 10분 기준 + 여유)
// Amplify/Lambda는 700초, Vercel Preview(hobby)는 최대 300초 제한
export const maxDuration = process.env.VERCEL ? 300 : 700;

async function handler(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  if (!API_BASE_PATH) {
    return NextResponse.json({ error: 'API URL not configured' }, { status: 500 });
  }

  const { path } = await params;
  const url = new URL(`${API_BASE_PATH}/${path.join('/')}`);
  url.search = request.nextUrl.search;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_KEY)?.value;

  const headers = new Headers(request.headers);
  headers.delete('cookie');
  headers.delete('accept-encoding');
  headers.set('host', new URL(API_BASE_PATH).host);

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  const isSSERequest = request.headers.get('accept')?.includes('text/event-stream');

  const response = await fetch(url.toString(), {
    method: request.method,
    headers,
    body: hasBody ? request.body : undefined,
    signal: request.signal,
    duplex: 'half',
  } as RequestInit);

  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete('content-encoding');
  responseHeaders.delete('set-cookie');

  if (isSSERequest && response.ok && response.body) {
    responseHeaders.set('content-type', 'text/event-stream');
    responseHeaders.set('cache-control', 'no-cache');
    responseHeaders.set('connection', 'keep-alive');
    // 중간 프록시 버퍼링 비활성화
    responseHeaders.set('x-accel-buffering', 'no');

    const KEEPALIVE_INTERVAL_MS = 30_000;
    const encoder = new TextEncoder();
    const keepaliveChunk = encoder.encode(': keepalive\n\n');

    const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
    const writer = writable.getWriter();

    (async () => {
      const reader = response.body!.getReader();
      const keepaliveTimer: ReturnType<typeof setInterval> = setInterval(async () => {
        try {
          await writer.write(keepaliveChunk);
        } catch {
          clearInterval(keepaliveTimer);
        }
      }, KEEPALIVE_INTERVAL_MS);

      // 클라이언트 연결 종료 시 upstream reader를 취소하여 리소스 누수 방지
      const abortHandler = () => {
        reader.cancel().catch(() => {});
      };
      request.signal.addEventListener('abort', abortHandler);

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          await writer.write(value);
        }
      } catch (e) {
        // 클라이언트 취소(abort)로 인한 종료는 정상 흐름
        if (!request.signal.aborted) {
          console.error('[SSE Proxy] stream error:', e);
        }
        reader.cancel().catch(() => {});
      } finally {
        clearInterval(keepaliveTimer);
        request.signal.removeEventListener('abort', abortHandler);
        writer.close().catch(() => {});
      }
    })();

    return new NextResponse(readable, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  }

  responseHeaders.delete('transfer-encoding');

  const body = await response.arrayBuffer();

  return new NextResponse(body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
