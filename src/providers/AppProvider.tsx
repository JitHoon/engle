'use client';

import { type ReactNode } from 'react';
import QueryProvider from './QueryProvider';
import ThemeProvider from './ThemeProvider';
import { AppContextProvider } from '@/contexts/AppContext';

interface AppProviderProps {
  children: ReactNode;
}

export default function AppProvider({ children }: AppProviderProps) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AppContextProvider>{children}</AppContextProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
