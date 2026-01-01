'use client';

import { type ReactNode } from 'react';
import QueryProvider from './QueryProvider';
import ThemeProvider from './ThemeProvider';
import { AppContextProvider } from '@/contexts/AppContext';
import EmotionRegistry from '@/lib/emotion-cache';

interface AppProviderProps {
  children: ReactNode;
}

export default function AppProvider({ children }: AppProviderProps) {
  return (
    <EmotionRegistry>
      <QueryProvider>
        <ThemeProvider>
          <AppContextProvider>{children}</AppContextProvider>
        </ThemeProvider>
      </QueryProvider>
    </EmotionRegistry>
  );
}
