// src/lib/theme/README.md
# Design System Documentation

This directory contains the implementation of our design system and theme management solution.

## Architecture

- **types.ts**: Core interfaces and types for theme configuration
- **theme-service.ts**: Implementation of theme management functionality
- **utils.ts**: Shared styling utilities and helper functions

## Usage

1. Wrap your application with `ThemeProvider` from `next-themes`
2. Use the `ThemeToggle` component for theme switching
3. Access theme values through the `useTheme` hook
4. Refer to the style guide at `/style-guide` for visual reference

## Best Practices

- Use CSS variables defined in `globals.css` for colors and spacing
- Follow the BEM naming convention for component classes
- Keep component styles in dedicated CSS modules
- Document all design tokens in the style guide

## Maintenance

- Update theme values in `theme-service.ts` for both light and dark modes
- Add new design tokens to the `ThemeConfig` interface
- Extend the style guide with new components and tokens
- Use `npm run lint` to ensure consistent code style