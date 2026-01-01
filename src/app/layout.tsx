import type { Metadata } from 'next';
import { AppProvider } from '@/providers';

export const metadata: Metadata = {
  title: 'Engle',
  description: 'Next.js App with MUI, TanStack Query, and React Hook Form',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
