'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

// App 상태 타입 정의
interface AppState {
  isLoading: boolean;
  isSidebarOpen: boolean;
}

// Context 액션 타입 정의
interface AppContextType extends AppState {
  setIsLoading: (isLoading: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
}

// 기본값 정의
const initialState: AppState = {
  isLoading: false,
  isSidebarOpen: true,
};

// Context 생성
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider 컴포넌트
interface AppContextProviderProps {
  children: ReactNode;
}

export function AppContextProvider({ children }: AppContextProviderProps) {
  const [state, setState] = useState<AppState>(initialState);

  const setIsLoading = useCallback((isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }));
  }, []);

  const toggleSidebar = useCallback(() => {
    setState((prev) => ({ ...prev, isSidebarOpen: !prev.isSidebarOpen }));
  }, []);

  const setSidebarOpen = useCallback((isOpen: boolean) => {
    setState((prev) => ({ ...prev, isSidebarOpen: isOpen }));
  }, []);

  const value: AppContextType = {
    ...state,
    setIsLoading,
    toggleSidebar,
    setSidebarOpen,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom Hook
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
}

export default AppContext;
