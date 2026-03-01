"use client";

import { ThemeProvider } from 'next-themes';

interface ThemeProviderWrapperProps {
  children: React.ReactNode;
}

export default function ThemeProviderWrapper({ children }: ThemeProviderWrapperProps): React.ReactElement {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}
