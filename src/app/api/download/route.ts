import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOSTS = [
  'weeth-s3-dev.s3.ap-northeast-2.amazonaws.com',
  'weeth-s3-prod.s3.ap-northeast-2.amazonaws.com',
];

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  const fileName = request.nextUrl.searchParams.get('fileName');

  if (!url) {
    return NextResponse.json({ error: 'url is required' }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: 'invalid url' }, { status: 400 });
  }

  if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
    return NextResponse.json({ error: 'forbidden host' }, { status: 403 });
  }

  const upstream = await fetch(url);
  if (!upstream.ok) {
    return NextResponse.json({ error: 'upstream error' }, { status: upstream.status });
  }

  const headers = new Headers();
  const contentType = upstream.headers.get('content-type');
  if (contentType) headers.set('Content-Type', contentType);

  const safeName = (fileName ?? 'download').replace(/[^\w\s.\-()가-힣ㄱ-ㅎㅏ-ㅣ]/g, '_');
  headers.set(
    'Content-Disposition',
    `attachment; filename*=UTF-8''${encodeURIComponent(safeName)}`,
  );

  return new NextResponse(upstream.body, { status: 200, headers });
}
