# Engle

Next.js 14+ 기반 웹 애플리케이션 프로젝트입니다.

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **State Management**: React Context API
- **Server State**: TanStack Query (React Query)
- **UI Library**: MUI (Material-UI)
- **Form Handling**: React Hook Form

## 프로젝트 구조

```
src/
├── app/                  # Next.js App Router 페이지
│   ├── layout.tsx       # 루트 레이아웃
│   ├── page.tsx         # 메인 페이지
│   └── globals.css      # 전역 스타일
├── components/          # 재사용 가능한 컴포넌트
│   └── ExampleForm.tsx  # 예시 폼 컴포넌트
├── contexts/            # React Context 정의
│   └── AppContext.tsx   # 앱 전역 상태 Context
├── hooks/               # 커스텀 React Hooks
│   └── useExample.ts    # TanStack Query 사용 예시
├── lib/                 # 유틸리티 함수
│   └── api.ts           # API 호출 유틸리티
├── providers/           # Context Provider 컴포넌트
│   ├── AppProvider.tsx  # 통합 Provider
│   ├── QueryProvider.tsx # TanStack Query Provider
│   └── ThemeProvider.tsx # MUI Theme Provider
└── types/               # TypeScript 타입 정의
    └── index.ts         # 공통 타입
```

## 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 애플리케이션을 확인할 수 있습니다.

### 프로덕션 빌드

```bash
npm run build
npm start
```

### 린트 검사

```bash
npm run lint
```

## 주요 기능

### TanStack Query

서버 상태 관리를 위한 TanStack Query가 설정되어 있습니다. `src/hooks/useExample.ts`에서 사용 예시를 확인할 수 있습니다.

```typescript
import { useExampleQuery, useExampleMutation } from '@/hooks';

// 데이터 조회
const { data, isLoading, error } = useExampleQuery();

// 데이터 생성
const mutation = useExampleMutation();
mutation.mutate({ title: 'New Item', description: 'Description' });
```

### React Context API

전역 상태 관리를 위한 Context가 설정되어 있습니다.

```typescript
import { useAppContext } from '@/contexts';

const { isLoading, isSidebarOpen, toggleSidebar } = useAppContext();
```

### React Hook Form

폼 상태 관리와 유효성 검사를 위한 React Hook Form이 설정되어 있습니다. `src/components/ExampleForm.tsx`에서 사용 예시를 확인할 수 있습니다.

### MUI (Material-UI)

Material Design 기반 UI 컴포넌트가 설정되어 있습니다. 테마 커스터마이징은 `src/providers/ThemeProvider.tsx`에서 수정할 수 있습니다.

## 환경 변수

필요한 환경 변수를 `.env.local` 파일에 설정하세요:

```
NEXT_PUBLIC_API_URL=your_api_url
```

## 라이선스

MIT
