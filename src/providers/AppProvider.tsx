'use client';

import { type ReactNode } from 'react';
import QueryProvider from './QueryProvider';
import ThemeProvider from './ThemeProvider';
import { AppContextProvider } from '@/contexts/AppContext';
import { AuthProvider } from '@/contexts/AuthContext';
import EmotionRegistry from '@/lib/emotion-cache';

interface AppProviderProps {
  children: ReactNode;
}

export default function AppProvider({ children }: AppProviderProps) {
  return (
    <EmotionRegistry>
      <QueryProvider>
        <ThemeProvider>
          <AuthProvider>
            <AppContextProvider>{children}</AppContextProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryProvider>
    </EmotionRegistry>
  );
}
