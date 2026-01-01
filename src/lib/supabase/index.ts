// 클라이언트 사이드 Supabase 클라이언트
export { createClient } from './client';

// 서버 사이드 Supabase 클라이언트
export { createClient as createServerClient } from './server';

// 미들웨어용 함수
export { updateSession } from './middleware';
