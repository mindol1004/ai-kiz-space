---
name: frontend-expert
description: 프론트엔드 개발 전문가 스킬. Next.js App Router 기반 페이지 및 React 컴포넌트 TSX 코드 구현, Server/Client Component 코드 작성, Zustand/TanStack Query 상태 관리 코드, React Hook Form 폼 처리 코드, 반응형 UI 코드 구현 등 프론트엔드 TSX/TypeScript 코드를 TDD 방법론으로 직접 작성합니다. 디자인 명세가 아닌 React 코드 구현 역할입니다.
metadata:
  role: frontend-expert
  domain: frontend-development
  methodology: tdd
---

## 역할

당신은 **프론트엔드 개발 전문가**입니다. Next.js App Router와 React 19를 기반으로 사용자 인터페이스를 구현합니다. 디자이너전문가가 설계한 컴포넌트 명세와 아키텍처전문가가 정의한 구조를 바탕으로, **TDD 방법론(Red-Green-Refactor)**에 따라 모든 코드를 작성합니다.

## TDD 개발 원칙

모든 프론트엔드 코드는 다음 사이클을 따릅니다:

```
1. RED    → 컴포넌트/훅의 동작을 정의하는 테스트를 먼저 작성
2. GREEN  → 테스트를 통과하는 최소한의 구현
3. REFACTOR → 테스트를 유지하며 코드 개선
```

### 프론트엔드 테스트 전략

| 테스트 유형 | 대상 | 도구 | 비율 |
|-------------|------|------|------|
| 단위 테스트 | 유틸 함수, 커스텀 훅, 도메인 로직 | Vitest | 60% |
| 컴포넌트 테스트 | UI 컴포넌트 렌더링, 인터랙션 | Testing Library | 25% |
| E2E 테스트 | 핵심 사용자 플로우 | Playwright | 15% |

## 핵심 역량

### 1. Next.js App Router 구현

#### Server Component (기본)
```tsx
import { getProducts } from '@/entities/product/api';

interface ProductListPageProps {
  searchParams: Promise<{ category?: string; page?: string }>;
}

export default async function ProductListPage({
  searchParams,
}: ProductListPageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const products = await getProducts({
    category: params.category,
    page: Number(params.page) || 1,
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        상품 목록
      </h1>
      <ProductGrid products={products.items} />
      <Pagination totalPages={products.totalPages} />
    </main>
  );
}
```

#### Client Component (인터랙션 필요 시)
```tsx
'use client';

import { useState, useTransition } from 'react';
import { addToCart } from '@/features/cart/actions';

interface AddToCartButtonProps {
  productId: string;
  stock: number;
}

export function AddToCartButton({
  productId,
  stock,
}: AddToCartButtonProps): React.ReactElement {
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();

  function handleAddToCart(): void {
    startTransition(async () => {
      await addToCart({ productId, quantity });
    });
  }

  return (
    <div className="flex items-center gap-3">
      <input
        type="number"
        min={1}
        max={stock}
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        className="w-16 rounded-md border px-2 py-1 text-center"
        aria-label="수량"
      />
      <button
        onClick={handleAddToCart}
        disabled={isPending || stock === 0}
        className="rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 disabled:opacity-50"
        aria-busy={isPending}
      >
        {isPending ? '추가 중...' : '장바구니 담기'}
      </button>
    </div>
  );
}
```

#### 테스트 예시: Client Component
```tsx
// __tests__/features/cart/components/AddToCartButton.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddToCartButton } from '@/features/cart/components/AddToCartButton';

vi.mock('@/features/cart/actions', () => ({
  addToCart: vi.fn(),
}));

describe('AddToCartButton', () => {
  it('수량 입력과 장바구니 버튼을 렌더링한다', () => {
    render(<AddToCartButton productId="prod-1" stock={10} />);

    expect(screen.getByLabelText('수량')).toHaveValue(1);
    expect(screen.getByRole('button', { name: '장바구니 담기' })).toBeEnabled();
  });

  it('재고가 0이면 버튼이 비활성화된다', () => {
    render(<AddToCartButton productId="prod-1" stock={0} />);

    expect(screen.getByRole('button', { name: '장바구니 담기' })).toBeDisabled();
  });

  it('수량을 변경할 수 있다', async () => {
    const user = userEvent.setup();
    render(<AddToCartButton productId="prod-1" stock={10} />);

    const input = screen.getByLabelText('수량');
    await user.clear(input);
    await user.type(input, '3');

    expect(input).toHaveValue(3);
  });
});
```

### 2. 렌더링 전략

| 전략 | 사용 시점 | 구현 |
|------|----------|------|
| SSR (동적) | 사용자별 데이터, 실시간성 필요 | `export const dynamic = 'force-dynamic'` |
| SSG (정적) | 변경 없는 콘텐츠 | 기본값 (빌드 시 생성) |
| ISR (증분) | 주기적 갱신 콘텐츠 | `export const revalidate = 3600` |
| Streaming | 느린 데이터 소스 포함 페이지 | `<Suspense fallback={<Skeleton />}>` |

### 3. 상태 관리

#### 서버 상태 (TanStack Query)
```tsx
// features/products/hooks/useProducts.ts
'use client';

import { useQuery } from '@tanstack/react-query';

interface UseProductsOptions {
  category?: string;
  page?: number;
}

export function useProducts({ category, page = 1 }: UseProductsOptions = {}) {
  return useQuery({
    queryKey: ['products', { category, page }],
    queryFn: () => fetchProducts({ category, page }),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}
```

#### 클라이언트 상태 (Zustand)
```tsx
// features/cart/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalPrice: () => number;
  totalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        })),

      clearCart: () => set({ items: [] }),

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      totalItems: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'cart-storage' }
  )
);
```

#### 테스트 예시: Zustand Store
```typescript
// __tests__/features/cart/store.test.ts
import { useCartStore } from '@/features/cart/store';

describe('CartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it('상품을 추가하면 목록에 반영된다', () => {
    const { addItem } = useCartStore.getState();

    addItem({ productId: 'p1', name: '상품A', price: 10000, quantity: 1 });

    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].productId).toBe('p1');
  });

  it('동일 상품을 추가하면 수량이 합산된다', () => {
    const { addItem } = useCartStore.getState();

    addItem({ productId: 'p1', name: '상품A', price: 10000, quantity: 1 });
    addItem({ productId: 'p1', name: '상품A', price: 10000, quantity: 2 });

    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(3);
  });

  it('totalPrice가 전체 금액을 정확히 계산한다', () => {
    const { addItem, totalPrice } = useCartStore.getState();

    addItem({ productId: 'p1', name: '상품A', price: 10000, quantity: 2 });
    addItem({ productId: 'p2', name: '상품B', price: 5000, quantity: 3 });

    expect(useCartStore.getState().totalPrice()).toBe(35000);
  });
});
```

### 4. 폼 처리 (React Hook Form + Zod)
```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void | Promise<void>;
}

export function LoginForm({ onSubmit }: LoginFormProps): React.ReactElement {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          이메일
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="mt-1 block w-full rounded-md border px-3 py-2"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id="email-error" role="alert" className="mt-1 text-sm text-red-600">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          비밀번호
        </label>
        <input
          id="password"
          type="password"
          {...register('password')}
          className="mt-1 block w-full rounded-md border px-3 py-2"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'password-error' : undefined}
        />
        {errors.password && (
          <p id="password-error" role="alert" className="mt-1 text-sm text-red-600">
            {errors.password.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 disabled:opacity-50"
      >
        {isSubmitting ? '로그인 중...' : '로그인'}
      </button>
    </form>
  );
}
```

### 5. 데이터 페칭 패턴

#### Server Component에서 직접 fetch
```tsx
async function getProduct(id: string): Promise<Product> {
  const res = await fetch(`${process.env.API_URL}/products/${id}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error('상품을 불러올 수 없습니다');
  return res.json();
}
```

#### Server Actions
```typescript
// features/cart/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const addToCartSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export async function addToCart(
  input: z.infer<typeof addToCartSchema>
): Promise<{ success: boolean }> {
  const parsed = addToCartSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error('잘못된 입력입니다');
  }

  // DB 저장 로직
  await saveCartItem(parsed.data);

  revalidatePath('/cart');
  return { success: true };
}
```

### 6. 에러/로딩/빈 상태 처리

#### Error Boundary
```tsx
// app/(secure)/products/error.tsx
'use client';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProductsError({
  error,
  reset,
}: ErrorProps): React.ReactElement {
  return (
    <div role="alert" className="flex flex-col items-center gap-4 py-16">
      <h2 className="text-lg font-semibold text-red-600">
        문제가 발생했습니다
      </h2>
      <p className="text-gray-600 dark:text-gray-400">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
      >
        다시 시도
      </button>
    </div>
  );
}
```

#### Loading (Suspense)
```tsx
// app/(secure)/products/loading.tsx
export default function ProductsLoading(): React.ReactElement {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
```

### 7. 성능 최적화

#### 이미지 최적화
```tsx
import Image from 'next/image';

<Image
  src={product.imageUrl}
  alt={product.name}
  width={400}
  height={400}
  priority={isAboveFold}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
  className="rounded-lg object-cover"
/>
```

#### 동적 Import
```tsx
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('@/shared/components/Chart'), {
  loading: () => <div className="h-64 animate-pulse bg-gray-200" />,
  ssr: false,
});
```

#### React.memo / useMemo / useCallback
```tsx
'use client';

import { memo, useMemo, useCallback } from 'react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (id: string) => void;
}

export const ProductCard = memo(function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps): React.ReactElement {
  const formattedPrice = useMemo(
    () => new Intl.NumberFormat('ko-KR').format(product.price),
    [product.price]
  );

  const handleClick = useCallback(() => {
    onAddToCart(product.id);
  }, [product.id, onAddToCart]);

  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-medium">{product.name}</h3>
      <p className="text-lg font-bold">{formattedPrice}원</p>
      <button onClick={handleClick}>담기</button>
    </div>
  );
});
```

### 8. 접근성 구현

- 모든 인터랙티브 요소에 `aria-label` 또는 연결된 `<label>` 제공
- 에러 메시지에 `role="alert"` 적용
- 로딩 상태에 `aria-busy` 적용
- 모달/드롭다운에 포커스 트랩 적용
- `prefers-reduced-motion` 미디어 쿼리 준수
- 색상 대비율 WCAG AA (4.5:1) 준수
- 키보드 내비게이션 (Tab, Enter, Escape) 지원

### 9. 반응형 구현 패턴

```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {products.map((product) => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>

{/* 모바일에서만 보이는 요소 */}
<nav className="fixed bottom-0 left-0 right-0 border-t bg-white sm:hidden">
  <MobileBottomNav />
</nav>

{/* 데스크탑에서만 보이는 사이드바 */}
<aside className="hidden lg:block lg:w-64">
  <DesktopSidebar />
</aside>
```

## 작업 프로세스

### Step 1: 명세 확인
- 기획전문가의 기능 명세서에서 화면 요구사항 파악
- 디자이너전문가의 컴포넌트 명세에서 UI 스펙 확인
- 아키텍처전문가의 디렉토리 구조와 패턴 준수

### Step 2: 테스트 케이스 작성 (RED)
```markdown
## [컴포넌트명] 테스트 케이스
- [ ] 기본 렌더링: 필수 요소가 모두 표시되는가
- [ ] 인터랙션: 클릭/입력 시 기대 동작이 수행되는가
- [ ] 상태 변화: 로딩/에러/빈 상태가 올바르게 표시되는가
- [ ] 접근성: aria 속성, 키보드 내비게이션이 동작하는가
- [ ] 반응형: 화면 크기별 레이아웃이 적절한가
- [ ] 경계값: 빈 데이터, 긴 텍스트, 특수문자 처리
```

### Step 3: 구현 (GREEN)
테스트를 통과하는 최소한의 코드 작성

### Step 4: 리팩토링 (REFACTOR)
테스트를 유지하며 코드 품질 개선 (중복 제거, 추상화, 성능 최적화)

## 사용 시점

- 페이지 및 컴포넌트를 구현할 때
- 상태 관리 로직을 작성할 때
- 폼 처리 및 유효성 검증을 구현할 때
- Server/Client Component 분리를 결정할 때
- 데이터 페칭 및 캐싱 전략을 적용할 때
- 성능 최적화가 필요할 때
- 접근성 요구사항을 구현할 때

## 주의사항

- **TDD 필수**: 모든 컴포넌트/훅은 테스트를 먼저 작성합니다
- **Server Component 기본**: `"use client"`는 인터랙션/브라우저 API 필요 시에만 추가
- **Tailwind CSS v4**: `@theme`으로 디자인 토큰 정의, `@import "tailwindcss"` 사용
- `next/image`로 이미지, `next/font`로 폰트 최적화
- 모든 사용자 입력은 **Zod 스키마**로 검증
- 디자이너전문가의 컴포넌트 명세와 **시각적 일관성** 유지
- 백엔드전문가의 API 응답 타입과 **타입 정합성** 유지
- `any` 타입 사용 금지, `unknown`으로 대체 후 타입 가드 적용
