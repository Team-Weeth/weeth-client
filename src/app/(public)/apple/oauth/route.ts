import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const error = request.nextUrl.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/login', origin));
  }

  const registered = request.nextUrl.searchParams.get('registered') === 'true';
  const name = request.nextUrl.searchParams.get('name');

  const redirectUrl = registered ? '/hub' : '/login?terms=true';
  const redirectResponse = NextResponse.redirect(new URL(redirectUrl, origin));

  if (name) {
    redirectResponse.cookies.set('userName', name, {
      path: '/',
      maxAge: 60 * 5,
    });
  }

  return redirectResponse;
}
