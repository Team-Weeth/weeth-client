import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const error = request.nextUrl.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/login', appUrl));
  }

  const registered = request.nextUrl.searchParams.get('registered') === 'true';
  const name = request.nextUrl.searchParams.get('name');

  const redirectUrl = registered ? '/hub' : '/login?terms=true';
  const redirectResponse = NextResponse.redirect(new URL(redirectUrl, appUrl));

  if (name) {
    redirectResponse.cookies.set('userName', name, {
      path: '/',
      maxAge: 60 * 5,
    });
  }

  return redirectResponse;
}
