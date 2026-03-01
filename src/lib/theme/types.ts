// src/lib/theme/types.ts
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
  };
  spacing: Record<string, string>;
  typography: {
    fontFamily: {
      sans: string;
      mono: string;
    };
    fontSize: {
      sm: string;
      base: string;
      lg: string;
      xl: string;
    };
  };
}

export interface ThemeService {
  currentTheme: ThemeConfig;
  toggleTheme: (themeName: string) => void;
  getTheme: (themeName: string) => ThemeConfig;
}