# AGENTS.md - Development Guidelines for This Project

This document provides guidelines for agentic coding agents working in this repository.

## Communication Rules

- Always respond in Korean language
- Use concise, direct responses
- Avoid unnecessary introductions or explanations

## Project Overview

- **Project Name**: 키즈공간 (Kids Space) — 키즈 전문 쇼핑몰 겸 커뮤니티
- **Framework**: Next.js 16.1.6 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Testing**: Vitest (unit/integration) + Playwright (E2E)
- **Linting**: ESLint 9 with eslint-config-next
- **DB**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js
- **State**: Zustand (client) + TanStack React Query (server)

---

## 개발 자동 참조 규칙 (중요)

개발 작업 시 아래 규칙을 **자동으로** 따른다. 사용자가 별도로 문서나 전문가를 지정하지 않아도 된다.

### 1. 기획 문서 자동 참조

모든 개발 작업 시 `docs/` 폴더의 기획 문서를 **반드시 먼저 읽고** 해당 스펙대로 구현한다.

| 문서 | 참조 시점 |
|------|-----------|
| `docs/01-서비스-개요서.md` | 프로젝트 전체 맥락, 기술 스택, 비즈니스 규칙 확인 |
| `docs/02-정보구조-사이트맵.md` | 페이지 생성 시 URL 구조, 렌더링 전략, 네비게이션, 인증 레벨 확인 |
| `docs/03-기능-명세서.md` | 기능 구현 시 입출력, 비즈니스 규칙, 예외 처리, 수용 기준 확인 |
| `docs/04-화면-정의서.md` | UI 구현 시 디자인 토큰, 컴포넌트 명세, 레이아웃, 반응형, 접근성 확인 |
| `docs/05-데이터-모델-설계서.md` | DB/API 작업 시 스키마, 관계, 인덱스, Enum, 삭제 규칙 확인 |
| `docs/06-API-설계서.md` | API 구현 시 엔드포인트, 요청/응답 형식, 에러 코드, Rate Limiting 확인 |
| `docs/07-개발-로드맵.md` | 디렉토리 구조, TDD 전략, CI/CD, 보안 체크리스트 확인 |

### 2. 전문가 스킬 자동 적용

작업 내용에 따라 `.opencode/skills/` 의 해당 전문가 스킬을 **자동으로** 적용한다.

| 키워드 | 적용 스킬 | 참조 문서 |
|--------|-----------|-----------|
| DB, 스키마, Prisma, 마이그레이션 | database-expert | 05-데이터-모델 |
| API, Route Handler, Server Action | backend-expert | 06-API, 03-기능 |
| 페이지, 컴포넌트, UI, 화면 | frontend-expert + designer-expert | 04-화면, 02-사이트맵 |
| 인증, 로그인, 보안, 암호화 | security-expert + backend-expert | 03-기능(FN-001,002) |
| 테스트, E2E, 커버리지 | qa-expert | 07-로드맵(TDD) |
| 배포, CI/CD, 환경설정 | infra-expert | 07-로드맵(CI/CD) |
| API 설계, CORS, Rate Limit | network-expert | 06-API |
| 구조, 아키텍처, 디렉토리 | architecture-expert | 07-로드맵(ADR) |

### 3. 기능 매핑 (간단한 요청 → 자동 매핑)

| 사용자가 이렇게 말하면 | 자동으로 참조할 내용 |
|-----------------------|---------------------|
| "회원가입 만들어줘" | FN-001, SCR-AUTH-002, User 스키마, /api/auth/register |
| "로그인 만들어줘" | FN-002, SCR-AUTH-001, NextAuth 설정 |
| "상품 목록 만들어줘" | FN-004, SCR-SHOP-001, Product 스키마, /api/products |
| "상품 상세 만들어줘" | FN-005, SCR-SHOP-003, ProductOption/Image |
| "검색 만들어줘" | FN-006, SCR-SHOP-004, /api/products/search |
| "장바구니 만들어줘" | FN-007, SCR-CART-001, CartItem, /api/cart, Zustand |
| "주문/결제 만들어줘" | FN-008, SCR-ORDER-001~003, Order, /api/orders, PG 연동 |
| "커뮤니티 만들어줘" | FN-011,012, SCR-COMM-001~003, Post/Comment, /api/posts |
| "리뷰 만들어줘" | FN-010, Review 스키마, /api/products/[id]/reviews |
| "마이페이지 만들어줘" | SCR-MY-001~005, /api/users/me |
| "관리자 만들어줘" | FN-014, SCR-ADMIN-001~010, /api/admin/* |
| "알림 만들어줘" | FN-013, Notification, /api/notifications |
| "홈 만들어줘" | SCR-HOME-001, 배너/추천/인기 |
| "공통 UI 만들어줘" | 디자인 토큰, Button/Input/Badge/Card 명세 |
| "레이아웃 만들어줘" | Header/Footer/BottomNav, 네비게이션 구조 |

### 4. 구현 시 필수 패턴

모든 구현 시 아래 패턴을 자동 적용한다:

- **API**: `withErrorHandler` + Zod 검증 + `ApiSuccessResponse`/`ApiErrorResponse` 형식
- **DB**: Repository 패턴 (인터페이스 → Prisma 구현)
- **인증**: `requireAuth()` / `requireRole()` / `requireOwnership()` 미들웨어
- **보안**: DOMPurify 산화, bcrypt 해싱, Parameterized Query, 보안 헤더
- **프론트**: Server Component 기본, Client는 필요 시만, React Query + Zustand
- **스타일**: Tailwind CSS v4 + 디자인 토큰 + 다크모드 + 반응형
- **접근성**: 시맨틱 HTML, aria 속성, 키보드 네비게이션, 포커스 관리
- **디렉토리**: FSD 구조 (app/ features/ entities/ shared/ widgets/ infrastructure/)

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

### File Organization (FSD + App Router)

```
app/            # Next.js App Router (라우팅, 페이지)
features/       # 도메인별 컴포넌트, hooks, actions
entities/       # 도메인 모델, Repository 인터페이스
shared/         # 공통 UI, lib, hooks, validations, types
widgets/        # 조합된 UI 블록 (Header, Footer 등)
infrastructure/ # Prisma Repository 구현, 외부 연동
stores/         # Zustand 스토어
prisma/         # 스키마, 시드, 마이그레이션
__tests__/      # E2E, 통합 테스트
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

- Tailwind CSS v4 uses `@import "tailwindcss"` (not `@tailwind` directives)
- Next.js 16 uses React 19 by default
- Use `Readonly<{...}>` for read-only props in Server Components
- Vitest for unit/integration tests, Playwright for E2E
- All test files in `__tests__/` directories or `*.test.{ts,tsx}`
