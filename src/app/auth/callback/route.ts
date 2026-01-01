import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

/**
 * OAuth Callback Route Handler
 *
 * Google OAuth 인증 후 리다이렉트되는 엔드포인트입니다.
 * Supabase가 전달한 code를 사용하여 세션을 교환합니다.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 인증 성공 - 지정된 페이지로 리다이렉트
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 인증 실패 - 에러 페이지로 리다이렉트
  return NextResponse.redirect(`${origin}/auth/error`);
}
