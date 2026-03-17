// Apple OAuth 콜백 Route Handler
import { NextResponse } from 'next/server';

export async function GET() {
  // TODO: Apple OAuth 콜백 처리
  return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'));
}
