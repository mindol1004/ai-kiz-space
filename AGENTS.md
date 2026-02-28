# AGENTS.md - Development Guidelines for This Project

This document provides guidelines for agentic coding agents working in this repository.

## Communication Rules

- Always respond in Korean language
- Use concise, direct responses
- Avoid unnecessary introductions or explanations

## Project Overview

- **Framework**: Next.js 16.1.6 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Testing**: No test framework configured
- **Linting**: ESLint 9 with eslint-config-next

---

## Commands

### Development
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
```

### Linting
```bash
npm run lint         # Run ESLint on entire project
npm run lint <file>  # Lint specific file
```

---

## Code Style Guidelines

### General Rules

- Use **TypeScript** for all files (`.ts`/`.tsx`)
- Enable **strict mode** in TypeScript (`tsconfig.json`)
- Use **ES modules** (import/export syntax)
- Use **2 spaces** for indentation

### Imports

- Use **path aliases**: `@/*` maps to project root
- Order imports:
  1. Next.js/React imports (e.g., `next/image`, `next/font/google`)
  2. External libraries
  3. Internal imports (`@/components/*`, `@/lib/*`)
  4. Relative imports (`./`, `../`)
- Use named exports where possible
- Example:
  ```typescript
  import type { Metadata } from "next";
  import Image from "next/image";
  import { useState } from "react";
  import { MyComponent } from "@/components/MyComponent";
  import "./styles.css";
  ```

### Naming Conventions

- **Files**: Use kebab-case for config files, PascalCase for components, camelCase for utilities
  - Components: `MyComponent.tsx`
  - Utilities: `utils.ts`, `helper.ts`
  - Config: `next.config.ts`, `eslint.config.mjs`
- **Variables/Functions**: camelCase
- **Types/Interfaces**: PascalCase
- **Constants**: UPPER_SNAKE_CASE for compile-time constants, camelCase for runtime

### TypeScript

- Always declare return types for functions
- Use `type` for unions, intersections, and primitives
- Use `interface` for object shapes that may be extended
- Enable strict null checking
- Example:
  ```typescript
  interface UserProps {
    name: string;
    age?: number;
  }

  function getUser(id: string): Promise<User> {
    // ...
  }
  ```

### React/Next.js Patterns

- Use **Server Components** by default (no "use client" directive)
- Add "use client" only when using browser APIs or hooks
- Use TypeScript for component props
- Use `next/image` for images
- Use `next/font/google` for fonts
- Example component:
  ```typescript
  interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
  }

  export default function Button({ children, onClick }: ButtonProps) {
    return (
      <button className="btn" onClick={onClick}>
        {children}
      </button>
    );
  }
  ```

### Tailwind CSS v4

- Use utility classes directly in JSX
- Use `@theme` for custom design tokens in `globals.css`
- Support dark mode with `dark:` prefix
- Example:
  ```tsx
  <div className="flex items-center justify-between p-4 dark:bg-black">
    <span className="text-sm text-zinc-600 dark:text-zinc-400">Hello</span>
  </div>
  ```

### Error Handling

- Use TypeScript types for error states
- Let errors propagate in server components
- Handle errors in client components with error boundaries
- Avoid `any` type; use `unknown` when type is uncertain

### File Organization

```
app/                    # Next.js App Router
├── page.tsx           # Route pages
├── layout.tsx         # Layouts
├── globals.css        # Global styles
└── [folder]/          # Nested routes
    └── page.tsx
```

### Best Practices

1. **Performance**: Use `next/image` with `priority` for above-the-fold images
2. **Accessibility**: Use semantic HTML, include alt text for images
3. **Security**: Sanitize user inputs, avoid inline dangerous URLs
4. **SEO**: Export `metadata` from pages/layouts for SEO

---

## ESLint Configuration

The project uses `eslint-config-next` with TypeScript support:
- Strict mode enabled
- React hooks rules enforced
- No `any` type allowed
- Runs on `.next/`, `out/`, `build/` directories (ignored)

Run `npm run lint` before committing to catch issues.

---

## Additional Notes

- No test framework is currently configured
- Tailwind CSS v4 uses `@import "tailwindcss"` (not `@tailwind` directives)
- Next.js 16 uses React 19 by default
- Use `Readonly<{...}>` for read-only props in Server Components
