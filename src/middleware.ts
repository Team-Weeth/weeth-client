import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ALLOWED_PATHS = ['/landing'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (ALLOWED_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = '/landing';
  url.searchParams.set('blocked', 'true');

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|api|favicon|assets|.*\\.(?:svg|png|jpg|jpeg|gif|ico|webp|woff2?|ttf|css|js)$).*)'],
};
