import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_PATH } from '@/constants/api';
import { ACCESS_TOKEN_KEY } from '@/lib/apis/cookies';

// Amplify/Lambda 실행 시간 연장 (SSE 장기 연결 대응)
export const maxDuration = 300;

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

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          await writer.write(value);
        }
      } finally {
        clearInterval(keepaliveTimer);
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
