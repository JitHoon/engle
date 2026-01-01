# Engle

Next.js 14+ 기반 웹 애플리케이션 프로젝트입니다.

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **State Management**: React Context API
- **Server State**: TanStack Query (React Query)
- **UI Library**: MUI (Material-UI) - Tesla 스타일 테마
- **Form Handling**: React Hook Form
- **Authentication**: Supabase Auth (Google OAuth)

## 프로젝트 구조

```
src/
├── app/                      # Next.js App Router 페이지
│   ├── auth/                 # 인증 관련 라우트
│   │   ├── callback/         # OAuth 콜백 처리
│   │   └── error/            # 인증 에러 페이지
│   ├── login/                # 로그인 페이지
│   ├── dashboard/            # 보호된 대시보드 페이지
│   ├── layout.tsx            # 루트 레이아웃
│   └── page.tsx              # 메인 페이지
├── components/               # 재사용 가능한 컴포넌트
│   ├── auth/                 # 인증 관련 컴포넌트
│   │   ├── GoogleLoginButton.tsx
│   │   ├── UserProfile.tsx
│   │   ├── AuthStatus.tsx
│   │   └── ProtectedRoute.tsx
│   └── ExampleForm.tsx
├── contexts/                 # React Context 정의
│   ├── AppContext.tsx        # 앱 전역 상태
│   └── AuthContext.tsx       # 인증 상태 (Supabase)
├── hooks/                    # 커스텀 React Hooks
├── lib/                      # 유틸리티 함수
│   ├── supabase/             # Supabase 클라이언트
│   │   ├── client.ts         # 브라우저용 클라이언트
│   │   ├── server.ts         # 서버용 클라이언트
│   │   └── middleware.ts     # 미들웨어용 함수
│   ├── api.ts                # API 호출 유틸리티
│   └── colors.ts             # Tesla 컬러 상수
├── providers/                # Context Provider 컴포넌트
├── types/                    # TypeScript 타입 정의
└── middleware.ts             # Next.js 미들웨어 (인증 체크)
```

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 값들을 설정하세요:

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Supabase 프로젝트 설정

1. [Supabase Dashboard](https://supabase.com/dashboard)에서 새 프로젝트 생성
2. **Settings > API**에서 Project URL과 anon key 복사
3. **Authentication > Providers**에서 Google 활성화
4. Google Cloud Console에서 OAuth 2.0 자격 증명 생성
5. Supabase에 Google Client ID와 Secret 입력
6. Redirect URL 설정: `https://your-project-id.supabase.co/auth/v1/callback`

### 4. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 애플리케이션을 확인할 수 있습니다.

## 인증 기능

### Google OAuth 로그인

```typescript
import { useAuth } from '@/contexts';

function MyComponent() {
  const { signInWithGoogle, signOut, user, isAuthenticated } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user?.displayName}</p>
          <button onClick={signOut}>로그아웃</button>
        </>
      ) : (
        <button onClick={signInWithGoogle}>Google로 로그인</button>
      )}
    </div>
  );
}
```

### 보호된 라우트

미들웨어에서 자동으로 `/dashboard` 경로를 보호합니다. 로그인하지 않은 사용자는 `/login`으로 리다이렉트됩니다.

### 컴포넌트 사용

```typescript
import { GoogleLoginButton, AuthStatus, UserProfile } from '@/components';

// 헤더에서 인증 상태 표시
<AuthStatus />

// 로그인 버튼
<GoogleLoginButton />

// 사용자 프로필 (드롭다운 메뉴 포함)
<UserProfile />
```

## Supabase 설정 가이드

### 필요한 정보

1. **NEXT_PUBLIC_SUPABASE_URL**: Supabase 프로젝트 URL
2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Supabase 공개 키 (anon key)

### Google OAuth 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에서 새 프로젝트 생성
2. **APIs & Services > Credentials**에서 OAuth 2.0 Client ID 생성
3. Authorized redirect URIs에 추가:
   - `https://your-project-id.supabase.co/auth/v1/callback`
4. Supabase Dashboard에서 Google Provider 활성화 후 Client ID/Secret 입력

## 주요 기능

### TanStack Query

```typescript
import { useExampleQuery, useExampleMutation } from '@/hooks';

const { data, isLoading, error } = useExampleQuery();
```

### React Context API

```typescript
import { useAppContext } from '@/contexts';

const { isLoading, isSidebarOpen, toggleSidebar } = useAppContext();
```

### Tesla 테마

```typescript
import { teslaColors } from '@/lib';

// Tesla 컬러 사용
<Box sx={{ backgroundColor: teslaColors.red.main }} />
```

## 스크립트

```bash
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # ESLint 검사
```

## 라이선스

MIT
