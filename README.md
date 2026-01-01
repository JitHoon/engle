# Engle

Next.js 14+ 기반 웹 애플리케이션 프로젝트입니다.

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **State Management**: React Context API
- **Server State**: TanStack Query (React Query)
- **UI Library**: MUI (Material-UI) - Tesla 스타일 테마
- **Form Handling**: React Hook Form
- **Authentication**: Supabase Auth (Email/Password)

## 프로젝트 구조

```
src/
├── app/                      # Next.js App Router 페이지
│   ├── auth/                 # 인증 관련 라우트
│   │   ├── error/            # 인증 에러 페이지
│   │   └── reset-password/   # 비밀번호 재설정 페이지
│   ├── login/                # 로그인 페이지
│   ├── signup/               # 회원가입 페이지
│   ├── dashboard/            # 보호된 대시보드 페이지
│   ├── layout.tsx            # 루트 레이아웃
│   └── page.tsx              # 메인 페이지
├── components/               # 재사용 가능한 컴포넌트
│   ├── auth/                 # 인증 관련 컴포넌트
│   │   ├── LoginForm.tsx
│   │   ├── SignUpForm.tsx
│   │   ├── ForgotPasswordForm.tsx
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
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key
```

### 3. Supabase 프로젝트 설정

1. [Supabase Dashboard](https://supabase.com/dashboard)에서 새 프로젝트 생성
2. **Settings > API**에서:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
3. **Authentication > Providers**에서 Email 활성화 (기본 활성화됨)
4. **Authentication > URL Configuration**에서 Site URL 설정

### 4. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 애플리케이션을 확인할 수 있습니다.

## 인증 기능

### 이메일/비밀번호 인증

```typescript
import { useAuth } from '@/contexts';

function MyComponent() {
  const { 
    signIn,           // 로그인
    signUp,           // 회원가입
    signOut,          // 로그아웃
    resetPassword,    // 비밀번호 재설정 이메일 발송
    user,             // 현재 사용자 정보
    isAuthenticated,  // 로그인 여부
    isLoading,        // 로딩 상태
    error,            // 에러 메시지
  } = useAuth();

  // 로그인
  await signIn({ email: 'user@example.com', password: 'password' });

  // 회원가입
  await signUp({ 
    email: 'user@example.com', 
    password: 'password',
    displayName: '홍길동'
  });

  // 비밀번호 재설정 이메일 발송
  await resetPassword('user@example.com');
}
```

### 보호된 라우트

미들웨어에서 자동으로 `/dashboard` 경로를 보호합니다. 로그인하지 않은 사용자는 `/login`으로 리다이렉트됩니다.

### 컴포넌트 사용

```typescript
import { LoginForm, SignUpForm, AuthStatus, UserProfile } from '@/components';

// 헤더에서 인증 상태 표시
<AuthStatus />

// 로그인 폼
<LoginForm onSuccess={() => router.push('/dashboard')} />

// 회원가입 폼
<SignUpForm />

// 사용자 프로필 (드롭다운 메뉴 포함)
<UserProfile />
```

## Supabase 환경 변수 확인 방법

### NEXT_PUBLIC_SUPABASE_URL

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. **Settings** (왼쪽 메뉴) > **API**
4. **Project URL** 복사

### NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. **Settings** (왼쪽 메뉴) > **API**
4. **Project API keys** 섹션에서 `anon` `public` 키 복사

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
