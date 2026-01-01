import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  type Auth,
} from 'firebase/auth';

/**
 * Firebase 설정
 *
 * 아래 값들은 Firebase Console에서 프로젝트 설정 > 일반 > 내 앱에서 확인할 수 있습니다.
 * 환경 변수로 설정해야 합니다.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Firebase 앱 초기화 (중복 초기화 방지)
let app: FirebaseApp;
let auth: Auth;
let googleProvider: GoogleAuthProvider;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

auth = getAuth(app);
googleProvider = new GoogleAuthProvider();

// Google OAuth 추가 스코프 설정 (필요시)
googleProvider.addScope('profile');
googleProvider.addScope('email');

// 로그인 시 항상 계정 선택 화면 표시 (선택사항)
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export { app, auth, googleProvider };
