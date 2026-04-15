import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { API_V1_BASE_PATH } from '@/constants/api';
import { ACCESS_TOKEN_KEY } from '@/lib/apis/cookies';

async function handler(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  let baseUrl: URL;
  try {
    baseUrl = new URL(API_V1_BASE_PATH);
  } catch {
    return NextResponse.json({ error: 'API URL not configured' }, { status: 500 });
  }

  const { path } = await params;
  if (path.some((segment) => segment === '.' || segment === '..')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  const encodedPath = path.map((segment) => encodeURIComponent(segment)).join('/');
  const url = new URL(baseUrl);
  url.pathname = `${baseUrl.pathname.replace(/\/$/, '')}/${encodedPath}`;
  url.search = request.nextUrl.search;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_KEY)?.value;

  const headers = new Headers(request.headers);
  headers.delete('cookie');
  headers.delete('accept-encoding');
  headers.delete('authorization');
  headers.set('host', new URL(API_V1_BASE_PATH).host);

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';

  const timeout = AbortSignal.timeout(10_000);
  const signal = AbortSignal.any([timeout, request.signal]);

  try {
    const response = await fetch(url.toString(), {
      method: request.method,
      headers,
      body: hasBody ? request.body : undefined,
      signal,
      duplex: 'half',
    } as RequestInit);

    const body = await response.arrayBuffer();

    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('transfer-encoding');
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('content-length');
    responseHeaders.delete('set-cookie');

    return new NextResponse(body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      return NextResponse.json({ error: 'Upstream timeout' }, { status: 504 });
    }
    if (error instanceof DOMException && error.name === 'AbortError') {
      return NextResponse.json({ error: 'Request aborted' }, { status: 499 });
    }
    return NextResponse.json({ error: 'Upstream unreachable' }, { status: 502 });
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
