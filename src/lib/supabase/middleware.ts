import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * 미들웨어용 Supabase 클라이언트
 *
 * 미들웨어에서 세션을 갱신하고 인증 상태를 확인합니다.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 중요: createServerClient와 supabase.auth.getUser() 사이에
  // 어떤 로직도 작성하지 마세요. 간단한 실수로 인해 사용자가
  // 무작위로 로그아웃되는 디버깅하기 어려운 문제가 발생할 수 있습니다.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 보호된 경로 체크 (필요에 따라 수정)
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');

  // 인증 관련 페이지 (로그인, 회원가입 등)
  // 비밀번호 재설정 페이지는 제외 (이메일 링크로 접근해야 함)
  const isAuthRoute =
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/signup';

  // 로그인하지 않은 사용자가 보호된 경로에 접근 시 로그인 페이지로 리다이렉트
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 이미 로그인한 사용자가 로그인/회원가입 페이지에 접근 시 대시보드로 리다이렉트
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // 중요: supabaseResponse 객체를 반드시 그대로 반환해야 합니다.
  // NextResponse.next()로 새로운 응답 객체를 만들면 안 됩니다.
  return supabaseResponse;
}
