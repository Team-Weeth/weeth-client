// 카카오 OAuth 콜백 Route Handler
import { NextResponse } from 'next/server';

export async function GET() {
  // TODO: 카카오 OAuth 콜백 처리
  // TODO: 로그인 성공 후 'invite_code' 쿠키 확인
  //   → 있으면 cookies().delete('invite_code') 후 /hub/join?code=VALUE 로 리다이렉트
  //   → 없으면 /hub 로 리다이렉트
  return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'));
}
