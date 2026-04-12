import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_PATH } from '@/constants/api';
import { ACCESS_TOKEN_KEY } from '@/lib/apis/cookies';

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

  const response = await fetch(url.toString(), {
    method: request.method,
    headers,
    body: hasBody ? request.body : undefined,
    signal: request.signal,
    duplex: 'half',
  } as RequestInit);

  const body = await response.arrayBuffer();

  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete('transfer-encoding');
  responseHeaders.delete('content-encoding');
  responseHeaders.delete('set-cookie');

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
