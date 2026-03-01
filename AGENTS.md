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

### 3. 기능 만들기 — 간단 명령어 전체 목록

#### 기반/공통

| 명령 | 자동 매핑 |
|------|-----------|
| "DB 만들어줘" | Prisma 스키마 전체 작성(05-데이터-모델), 마이그레이션, 시드 데이터, Enum |
| "공통 UI 만들어줘" | 디자인 토큰(@theme), Button/Input/Badge/Card/Modal/Toast 컴포넌트(04-화면) |
| "레이아웃 만들어줘" | Header, Footer, BottomNav, 메인/인증/관리자 레이아웃(02-사이트맵, 04-화면) |
| "에러 처리 만들어줘" | AppError 계층, withErrorHandler, withValidation, 에러 페이지(404/500) |
| "인증 미들웨어 만들어줘" | requireAuth, requireRole, requireOwnership, Middleware(security) |

#### 인증

| 명령 | 자동 매핑 |
|------|-----------|
| "회원가입 만들어줘" | FN-001, SCR-AUTH-002, User 스키마, /api/auth/register, Zod 검증, bcrypt |
| "로그인 만들어줘" | FN-002, SCR-AUTH-001, NextAuth 설정, 소셜(카카오/네이버/구글), Rate Limiting |
| "비밀번호 찾기 만들어줘" | 비밀번호 찾기/재설정 페이지, /api/auth/forgot-password, 이메일 발송 |
| "소셜 로그인 만들어줘" | NextAuth Provider(카카오/네이버/구글), OAuth 콜백, 추가 정보 입력 |
| "인증 만들어줘" | 위 4개 전부 한 번에 |

#### 쇼핑

| 명령 | 자동 매핑 |
|------|-----------|
| "홈 만들어줘" | SCR-HOME-001, 히어로 배너, 카테고리, 인기/신상/연령별 추천, 커뮤니티 글, ISR |
| "카테고리 만들어줘" | Category 스키마, /api/categories, 3depth 트리, 메가 메뉴 |
| "상품 목록 만들어줘" | FN-004, SCR-SHOP-001, Product 스키마, /api/products, 필터/정렬/무한스크롤 |
| "상품 상세 만들어줘" | FN-005, SCR-SHOP-003, 이미지 갤러리, 옵션 선택, 탭, ISR |
| "검색 만들어줘" | FN-006, SCR-SHOP-004, /api/products/search/suggestions, 자동완성, 최근/인기 |
| "베스트 만들어줘" | /shop/best 페이지, 판매량순 상품, ISR |
| "쇼핑 만들어줘" | 위 전부 한 번에 |

#### 장바구니 & 주문

| 명령 | 자동 매핑 |
|------|-----------|
| "장바구니 만들어줘" | FN-007, SCR-CART-001, CartItem, /api/cart, Zustand persist, 서버 병합 |
| "위시리스트 만들어줘" | Wishlist 스키마, /api/wishlist, 토글 UI |
| "주문 만들어줘" | FN-008, SCR-ORDER-001~003, Order/OrderItem, /api/orders, 재고 트랜잭션 |
| "결제 만들어줘" | PG사(토스페이먼츠) 연동, 결제 검증, 결제 완료/실패 페이지 |
| "주문관리 만들어줘" | FN-009, 주문 상태 전이, 취소/반품/교환, 배송 추적, 구매 확정 |
| "배송지 만들어줘" | Address 스키마, /api/users/me/addresses, 기본 배송지, 우편번호 API |
| "주문/결제 만들어줘" | 위 전부 한 번에 |

#### 커뮤니티

| 명령 | 자동 매핑 |
|------|-----------|
| "게시판 만들어줘" | FN-011, SCR-COMM-001, Post 스키마, /api/posts, 카테고리별 목록 |
| "게시글 만들어줘" | SCR-COMM-002~003, 게시글 상세/글쓰기, Rich Text Editor, 태그, 연관상품 |
| "댓글 만들어줘" | FN-012, Comment 스키마, /api/posts/[id]/comments, 대댓글, 채택 |
| "좋아요 만들어줘" | PostLike/CommentLike, /api/posts/[id]/like, 낙관적 업데이트 |
| "북마크 만들어줘" | Bookmark 스키마, /api/posts/[id]/bookmark, 토글 |
| "신고 만들어줘" | FN-016, Report 스키마, /api/posts/[id]/report, 신고 사유 선택, 3건 자동 블라인드, 관리자 신고 관리 |
| "커뮤니티 만들어줘" | 위 전부 한 번에 |

#### 리뷰 & 평점

| 명령 | 자동 매핑 |
|------|-----------|
| "리뷰 만들어줘" | FN-010, Review/ReviewImage 스키마, /api/products/[id]/reviews, 포토리뷰, 평점 |

#### 마이페이지

| 명령 | 자동 매핑 |
|------|-----------|
| "프로필 만들어줘" | FN-003, SCR-MY-002, /api/users/me, 프로필 이미지, 닉네임 변경 |
| "자녀정보 만들어줘" | Child 스키마, /api/users/me/children, 연령 자동 계산 |
| "마이페이지 만들어줘" | SCR-MY-001~005, 대시보드, 주문/위시/게시글/댓글/북마크/쿠폰/포인트/배송지/알림 전부 |

#### 마케팅

| 명령 | 자동 매핑 |
|------|-----------|
| "쿠폰 만들어줘" | Coupon 스키마, /api/users/me/coupons, 정률/정액, 적용/만료 |
| "포인트 만들어줘" | PointHistory 스키마, /api/users/me/points, 적립/사용/만료 이력 |
| "기획전 만들어줘" | Exhibition 스키마, /api/exhibitions, 상품 배정, 기간 설정 |
| "배너 만들어줘" | Banner 스키마, /api/banners, 히어로/중간/상단, 기간/순서 |

#### 알림 & 정보

| 명령 | 자동 매핑 |
|------|-----------|
| "알림 만들어줘" | FN-013, Notification 스키마, /api/notifications, 유형별, 읽음 처리 |
| "공지사항 만들어줘" | Notice 스키마, /api/notices, /info/notices 페이지, SSG |
| "FAQ 만들어줘" | FAQ 스키마, /api/faq, /info/faq 페이지, 카테고리별, SSG |
| "약관 만들어줘" | /info/terms, /info/privacy 페이지, SSG |

#### 관리자

| 명령 | 자동 매핑 |
|------|-----------|
| "관리자 대시보드 만들어줘" | SCR-ADMIN-001, /api/admin/dashboard, 매출/주문/회원/미처리 |
| "관리자 상품관리 만들어줘" | /api/admin/products, 상품 CRUD, 이미지/옵션/재고 |
| "관리자 재고관리 만들어줘" | FN-015, SCR-ADMIN-011~012, /api/admin/inventory, 입고/출고/조정, StockHistory, 저재고 알림 |
| "관리자 주문관리 만들어줘" | /api/admin/orders, 상태 변경, 운송장 입력 |
| "관리자 회원관리 만들어줘" | /api/admin/users, 등급/상태 변경, 회원 상세 |
| "관리자 게시글관리 만들어줘" | /api/admin/posts, 삭제, 블라인드 |
| "관리자 리뷰관리 만들어줘" | /api/admin/reviews, 검수, 삭제, 베스트 리뷰 선정, 상태 변경 |
| "관리자 신고관리 만들어줘" | FN-016, SCR-ADMIN-013, /api/admin/reports, Report 스키마, 검토/기각, 3건 자동 블라인드 |
| "관리자 브랜드관리 만들어줘" | FN-017, /api/admin/brands, Brand CRUD, 로고 업로드 |
| "관리자 공지관리 만들어줘" | FN-017, SCR-ADMIN-014, /api/admin/notices, 공지 CRUD, 상단 고정 |
| "관리자 FAQ관리 만들어줘" | FN-017, SCR-ADMIN-015, /api/admin/faq, FAQ CRUD, 카테고리별, 순서 변경 |
| "관리자 통계 만들어줘" | /api/admin/analytics, 매출/회원/상품/트래픽 차트 |
| "감사로그 만들어줘" | AuditLog 스키마, /api/admin/audit-logs, 관리자 행위 자동 기록, 조회 UI |
| "관리자 만들어줘" | 위 전부 한 번에 |

#### 인프라 & 품질

| 명령 | 자동 매핑 |
|------|-----------|
| "CI/CD 만들어줘" | GitHub Actions 워크플로우(lint→test→build→deploy) |
| "테스트 만들어줘" | Vitest 단위/통합 + Playwright E2E, 핵심 플로우 |
| "보안 적용해줘" | 보안 헤더, OWASP 체크리스트, Rate Limiting, CSRF |
| "SEO 적용해줘" | 메타데이터, sitemap.xml, robots.txt, 구조화 데이터 |
| "다크모드 만들어줘" | next-themes, 디자인 토큰 dark 변형, 전역 적용 |
| "접근성 적용해줘" | axe-core 검사, aria 속성, 키보드 네비, WCAG 2.1 AA |

---

### 4. 수정하기 — 간단 명령어

#### 디자인 수정

| 명령 예시 | 자동 동작 |
|-----------|-----------|
| "버튼 색상 바꿔줘" | 04-화면-정의서 디자인 토큰 확인 → globals.css @theme 수정 + 해당 컴포넌트 수정 |
| "폰트 크기 바꿔줘" | 04-화면 타이포그래피 토큰 확인 → 해당 토큰/컴포넌트 수정 |
| "OO 페이지 레이아웃 수정해줘" | 04-화면 해당 SCR 확인 → 페이지 컴포넌트 수정 |
| "모바일 UI 수정해줘" | 반응형 브레이크포인트 확인 → Tailwind 반응형 클래스 수정 |
| "다크모드 색상 수정해줘" | 디자인 토큰 dark 값 수정 → globals.css 수정 |
| "OO 컴포넌트 스타일 수정해줘" | 04-화면 해당 컴포넌트 명세 확인 → Tailwind 클래스 수정 |
| "간격/여백 수정해줘" | spacing 토큰 확인 → 해당 요소 padding/margin/gap 수정 |
| "아이콘 바꿔줘" | 해당 컴포넌트 찾아서 아이콘 교체 |

**규칙**: 디자인 수정 시 반드시 `docs/04-화면-정의서.md`의 디자인 토큰 섹션을 먼저 확인하고, 토큰 값 변경이 필요하면 문서와 코드를 함께 수정한다. designer-expert 스킬 적용.

#### DB 수정

| 명령 예시 | 자동 동작 |
|-----------|-----------|
| "OO 테이블에 필드 추가해줘" | 05-데이터-모델 확인 → schema.prisma 수정 → 마이그레이션 → 관련 타입/API 수정 |
| "OO 테이블 관계 변경해줘" | 05-데이터-모델 관계도 확인 → FK/관계 수정 → 마이그레이션 → Repository 수정 |
| "인덱스 추가해줘" | 05-데이터-모델 인덱스 섹션 확인 → schema.prisma @@index 추가 → 마이그레이션 |
| "Enum 추가해줘" | 05-데이터-모델 Enum 섹션 확인 → schema.prisma enum 수정 → 타입 수정 |
| "시드 데이터 수정해줘" | prisma/seed.ts 수정 |
| "OO 테이블 삭제해줘" | 관계 의존성 확인 → schema.prisma 수정 → 마이그레이션 → 관련 코드 정리 |

**규칙**: DB 수정 시 반드시 `docs/05-데이터-모델-설계서.md`를 먼저 확인하고, 스키마 변경 후 문서도 함께 업데이트한다. 마이그레이션은 `npx prisma migrate dev --name 설명`으로 실행. database-expert 스킬 적용. 관련 API/타입도 연쇄 수정.

#### 기능(개발) 수정

| 명령 예시 | 자동 동작 |
|-----------|-----------|
| "OO API 수정해줘" | 06-API 해당 엔드포인트 확인 → Route Handler 수정 → Zod 스키마 수정 → 프론트 연동 수정 |
| "OO 비즈니스 규칙 변경해줘" | 03-기능-명세서 해당 BR 확인 → 관련 로직 수정 → 테스트 수정 |
| "OO 페이지에 기능 추가해줘" | 03-기능 + 04-화면 확인 → 컴포넌트/훅/API 추가 → 연동 |
| "OO 유효성 검증 바꿔줘" | 03-기능 입력/출력 확인 → Zod 스키마 수정 → 프론트/백엔드 동시 수정 |
| "OO 에러 처리 수정해줘" | 03-기능 예외 처리 확인 → AppError/API 응답 수정 → 프론트 에러 표시 수정 |
| "OO 상태 관리 수정해줘" | Zustand 스토어 또는 React Query 훅 수정 |
| "OO 권한 변경해줘" | 02-사이트맵 인증 레벨 확인 → Middleware/requireRole 수정 |
| "OO 알림 추가해줘" | FN-013 알림 유형 확인 → 해당 이벤트에 알림 생성 로직 추가 |
| "OO 포인트 규칙 바꿔줘" | 03-기능 포인트 BR 확인 → 적립/사용 로직 수정 |
| "OO 정렬/필터 추가해줘" | 해당 API 쿼리 파라미터 + 프론트 필터 UI 추가 |

**규칙**: 기능 수정 시 반드시 `docs/03-기능-명세서.md`와 `docs/06-API-설계서.md`를 먼저 확인하고, 변경이 필요하면 문서와 코드를 함께 수정한다. 수정 범위가 프론트+백엔드에 걸치면 양쪽 모두 수정. backend-expert + frontend-expert 스킬 적용.

#### 문서만 수정

| 명령 예시 | 자동 동작 |
|-----------|-----------|
| "기획 문서 수정해줘" | docs/ 해당 문서 수정 (planning-expert 형식 유지) |
| "새 기능 기획해줘" | docs/ 관련 문서들에 기능 ID, 화면, API, DB 추가 |
| "요구사항 추가해줘" | 01-서비스-개요서 또는 03-기능-명세서에 추가 |

---

### 6. 구현 시 필수 패턴

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
