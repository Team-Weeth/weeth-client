import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_TOKEN_KEY } from '@/lib/apis/cookies';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function handler(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  if (!BASE_URL) {
    return NextResponse.json({ error: 'API URL not configured' }, { status: 500 });
  }

  const { path } = await params;
  const url = new URL(`/${path.join('/')}`, BASE_URL);
  url.search = request.nextUrl.search;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_KEY)?.value;

  const headers = new Headers(request.headers);
  headers.delete('cookie');
  headers.set('host', new URL(BASE_URL).host);

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const body =
    request.method !== 'GET' && request.method !== 'HEAD' ? await request.arrayBuffer() : undefined;

  const response = await fetch(url.toString(), {
    method: request.method,
    headers,
    body: body?.byteLength ? body : undefined,
  });

  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete('transfer-encoding');

  if (response.status === 204) {
    return new NextResponse(null, {
      status: 204,
      headers: responseHeaders,
    });
  }

  const responseBody = await response.arrayBuffer();

  return new NextResponse(responseBody, {
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
