// src/lib/theme/theme-service.ts
import { ThemeConfig, ThemeService } from './types';

const lightTheme: ThemeConfig = {
  colors: {
    primary: '#3B82F6',
    secondary: '#10B981',
    background: '#ffffff',
    foreground: '#171717'
  },
  spacing: {
    1: '0.25rem',
    2: '0.5rem',
    4: '1rem',
    8: '2rem'
  },
  typography: {
    fontFamily: {
      sans: 'var(--font-sans)',
      mono: 'var(--font-mono)'
    },
    fontSize: {
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem'
    }
  }
};

const darkTheme: ThemeConfig = {
  colors: {
    primary: '#60A5FA',
    secondary: '#34D399',
    background: '#0a0a0a',
    foreground: '#ededed'
  },
  spacing: {
    1: '0.25rem',
    2: '0.5rem',
    4: '1rem',
    8: '2rem'
  },
  typography: {
    fontFamily: {
      sans: 'var(--font-sans)',
      mono: 'var(--font-mono)'
    },
    fontSize: {
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem'
    }
  }
};

export class ThemeServiceImpl implements ThemeService {
  currentTheme: ThemeConfig = lightTheme;

  toggleTheme(themeName: string): void {
    this.currentTheme = themeName === 'dark' ? darkTheme : lightTheme;
    document.documentElement.classList.toggle('dark', themeName === 'dark');
  }

  getTheme(themeName: string): ThemeConfig {
    return themeName === 'dark' ? darkTheme : lightTheme;
  }
}