---
name: backend-expert
description: 백엔드 개발 전문가 스킬. Next.js API Routes 코드 구현, Server Actions 작성, Repository 패턴 데이터 접근 계층 코드 작성, 비즈니스 로직 구현, 에러 처리 코드, Zod 검증 스키마 코드 작성 등 서버 사이드 코드 구현을 TDD 방법론으로 담당합니다. API 엔드포인트 코드를 직접 작성하는 역할입니다.
metadata:
  role: backend-expert
  domain: backend-development
  methodology: tdd
---

## 역할

당신은 **백엔드 개발 전문가**입니다. Next.js의 서버 사이드 기능(API Routes, Server Actions, Middleware)을 활용하여 비즈니스 로직과 데이터 접근 계층을 구현합니다. 데이터베이스전문가가 설계한 스키마와 아키텍처전문가가 정의한 구조를 바탕으로, **TDD 방법론(Red-Green-Refactor)**에 따라 모든 코드를 작성합니다.

## TDD 개발 원칙

모든 백엔드 코드는 다음 사이클을 따릅니다:

```text
1. RED    → API/비즈니스 로직의 기대 동작을 정의하는 테스트를 먼저 작성
2. GREEN  → 테스트를 통과하는 최소한의 구현
3. REFACTOR → 테스트를 유지하며 코드 개선
```

### 백엔드 테스트 전략

| 테스트 유형 | 대상 | 도구 | 비율 |
| --- | --- | --- | --- |
| 단위 테스트 | 도메인 로직, 유스케이스, 유틸 함수, 검증 스키마 | Vitest | 65% |
| 통합 테스트 | API Routes, Server Actions, DB 연동, 미들웨어 | Vitest + Supertest | 30% |
| E2E 테스트 | 전체 API 플로우 (인증 → 주문 → 결제) | Playwright | 5% |

## 핵심 역량

### 1. API Routes 구현

#### RESTful API Route

```typescript
// app/api/products/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { getProducts, createProduct } from '@/entities/product/api';
import { withErrorHandler } from '@/shared/lib/error-handler';

const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  price: z.number().int().positive(),
  categoryId: z.string().uuid(),
  description: z.string().max(2000).optional(),
  stock: z.number().int().nonnegative().default(0),
});

export const GET = withErrorHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page')) || 1;
  const limit = Math.min(Number(searchParams.get('limit')) || 20, 100);
  const category = searchParams.get('category') ?? undefined;

  const result = await getProducts({ page, limit, category });

  return NextResponse.json(result);
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();
  const parsed = createProductSchema.parse(body);

  const product = await createProduct(parsed);

  return NextResponse.json(product, { status: 201 });
});
```

#### 동적 Route

```typescript
// app/api/products/[id]/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getProductById, updateProduct, deleteProduct } from '@/entities/product/api';
import { NotFoundError } from '@/shared/lib/errors';
import { withErrorHandler } from '@/shared/lib/error-handler';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const GET = withErrorHandler(async (
  _req: NextRequest,
  { params }: RouteContext
) => {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) throw new NotFoundError('Product', id);

  return NextResponse.json(product);
});

export const PATCH = withErrorHandler(async (
  req: NextRequest,
  { params }: RouteContext
) => {
  const { id } = await params;
  const body = await req.json();
  const updated = await updateProduct(id, body);
  if (!updated) throw new NotFoundError('Product', id);

  return NextResponse.json(updated);
});

export const DELETE = withErrorHandler(async (
  _req: NextRequest,
  { params }: RouteContext
) => {
  const { id } = await params;
  await deleteProduct(id);

  return new NextResponse(null, { status: 204 });
});
```

#### 테스트 예시: API Route

```typescript
// __tests__/integration/api/products.test.ts
import { GET, POST } from '@/app/api/products/route';

function createRequest(
  method: string,
  body?: Record<string, unknown>,
  searchParams?: Record<string, string>
): NextRequest {
  const url = new URL('http://localhost:3000/api/products');
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      url.searchParams.set(key, value);
    }
  }
  return new NextRequest(url, {
    method,
    ...(body ? { body: JSON.stringify(body) } : {}),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('GET /api/products', () => {
  it('상품 목록을 페이지네이션과 함께 반환한다', async () => {
    const req = createRequest('GET', undefined, { page: '1', limit: '10' });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveProperty('items');
    expect(body).toHaveProperty('totalPages');
    expect(body.items.length).toBeLessThanOrEqual(10);
  });
});

describe('POST /api/products', () => {
  it('유효한 데이터로 상품을 생성하고 201을 반환한다', async () => {
    const req = createRequest('POST', {
      name: '테스트 상품',
      price: 29900,
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
      stock: 100,
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.name).toBe('테스트 상품');
    expect(body).toHaveProperty('id');
  });

  it('잘못된 가격으로 400을 반환한다', async () => {
    const req = createRequest('POST', {
      name: '테스트',
      price: -1000,
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });
});
```

### 2. Server Actions

```typescript
// features/orders/actions.ts
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/shared/lib/auth';
import { createOrder } from '@/entities/order/api';

const placeOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
  })).min(1, '주문 항목이 비어있습니다'),
  shippingAddressId: z.string().uuid(),
  paymentMethod: z.enum(['card', 'bank_transfer', 'virtual_account']),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;

interface ActionResult {
  success: boolean;
  error?: string;
  orderId?: string;
}

export async function placeOrder(input: PlaceOrderInput): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: '로그인이 필요합니다' };
  }

  const parsed = placeOrderSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((i) => i.message).join(', '),
    };
  }

  const order = await createOrder({
    ...parsed.data,
    userId: session.user.id,
  });

  revalidatePath('/orders');
  return { success: true, orderId: order.id };
}
```

#### 테스트 예시: Server Action

```typescript
// __tests__/features/orders/actions.test.ts
import { placeOrder } from '@/features/orders/actions';

vi.mock('@/shared/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/entities/order/api', () => ({
  createOrder: vi.fn(),
}));

import { auth } from '@/shared/lib/auth';
import { createOrder } from '@/entities/order/api';

describe('placeOrder', () => {
  it('인증되지 않은 사용자는 에러를 반환한다', async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const result = await placeOrder({
      items: [{ productId: 'uuid-1', quantity: 1 }],
      shippingAddressId: 'uuid-2',
      paymentMethod: 'card',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('로그인이 필요합니다');
  });

  it('유효한 주문을 생성하고 orderId를 반환한다', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
    });
    vi.mocked(createOrder).mockResolvedValue({ id: 'order-123' });

    const result = await placeOrder({
      items: [{ productId: 'uuid-1', quantity: 2 }],
      shippingAddressId: 'uuid-2',
      paymentMethod: 'card',
    });

    expect(result.success).toBe(true);
    expect(result.orderId).toBe('order-123');
    expect(createOrder).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-1' })
    );
  });

  it('빈 주문 항목은 에러를 반환한다', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
    });

    const result = await placeOrder({
      items: [],
      shippingAddressId: 'uuid-2',
      paymentMethod: 'card',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('주문 항목이 비어있습니다');
  });
});
```

### 3. 데이터 접근 계층 (Repository 패턴)

```typescript
// entities/product/repository.ts
export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findMany(params: FindManyParams): Promise<PaginatedResult<Product>>;
  create(data: CreateProductData): Promise<Product>;
  update(id: string, data: UpdateProductData): Promise<Product | null>;
  delete(id: string): Promise<void>;
}

// entities/product/api.ts (Prisma 구현)
import { prisma } from '@/shared/lib/prisma';
import type { ProductRepository } from './repository';

export class PrismaProductRepository implements ProductRepository {
  async findById(id: string): Promise<Product | null> {
    const data = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    return data ? this.toDomain(data) : null;
  }

  async findMany({
    page,
    limit,
    category,
  }: FindManyParams): Promise<PaginatedResult<Product>> {
    const where = category ? { categoryId: category } : {};

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { category: true },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      items: items.map(this.toDomain),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(data: CreateProductData): Promise<Product> {
    const created = await prisma.product.create({ data });
    return this.toDomain(created);
  }

  async update(id: string, data: UpdateProductData): Promise<Product | null> {
    const updated = await prisma.product.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.product.delete({ where: { id } });
  }

  private toDomain(data: PrismaProduct): Product {
    return {
      id: data.id,
      name: data.name,
      price: data.price,
      stock: data.stock,
      categoryId: data.categoryId,
      description: data.description,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
```

#### In-Memory Repository (테스트용)

```typescript
// shared/test-utils/repositories/in-memory-product.ts
import type { ProductRepository } from '@/entities/product/repository';
import { randomUUID } from 'crypto';

export class InMemoryProductRepository implements ProductRepository {
  private products: Product[] = [];

  async findById(id: string): Promise<Product | null> {
    return this.products.find((p) => p.id === id) ?? null;
  }

  async findMany({ page, limit }: FindManyParams): Promise<PaginatedResult<Product>> {
    const start = (page - 1) * limit;
    const items = this.products.slice(start, start + limit);
    return {
      items,
      total: this.products.length,
      page,
      limit,
      totalPages: Math.ceil(this.products.length / limit),
    };
  }

  async create(data: CreateProductData): Promise<Product> {
    const product: Product = {
      id: randomUUID(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.push(product);
    return product;
  }

  async update(id: string, data: UpdateProductData): Promise<Product | null> {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    this.products[index] = { ...this.products[index], ...data, updatedAt: new Date() };
    return this.products[index];
  }

  async delete(id: string): Promise<void> {
    this.products = this.products.filter((p) => p.id !== id);
  }

  seed(products: Product[]): void {
    this.products = [...products];
  }

  clear(): void {
    this.products = [];
  }
}
```

### 4. 인증/인가

#### Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_PATHS = ['/', '/login', '/register', '/api/auth'];
const ADMIN_PATHS = ['/admin', '/api/admin'];

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = await getToken({ req });

  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (ADMIN_PATHS.some((p) => pathname.startsWith(p)) && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};
```

#### 인가 헬퍼

```typescript
// shared/lib/auth-guard.ts
import { auth } from '@/shared/lib/auth';
import { UnauthorizedError, ForbiddenError } from '@/shared/lib/errors';

export async function requireAuth(): Promise<Session> {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();
  return session;
}

export async function requireRole(role: string): Promise<Session> {
  const session = await requireAuth();
  if (session.user.role !== role) throw new ForbiddenError();
  return session;
}
```

### 5. 에러 처리 시스템

```typescript
// shared/lib/errors.ts
export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly isOperational: boolean;
}

export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly isOperational = true;
  constructor(resource: string, id: string) {
    super(`${resource}을(를) 찾을 수 없습니다: ${id}`);
  }
}

export class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly isOperational = true;
  constructor(message: string) {
    super(message);
  }
}

export class UnauthorizedError extends AppError {
  readonly statusCode = 401;
  readonly isOperational = true;
  constructor() {
    super('인증이 필요합니다');
  }
}

export class ForbiddenError extends AppError {
  readonly statusCode = 403;
  readonly isOperational = true;
  constructor() {
    super('권한이 없습니다');
  }
}

export class ConflictError extends AppError {
  readonly statusCode = 409;
  readonly isOperational = true;
  constructor(message: string) {
    super(message);
  }
}
```

```typescript
// shared/lib/error-handler.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from './errors';

type RouteHandler = (
  req: NextRequest,
  context?: { params: Promise<Record<string, string>> }
) => Promise<NextResponse>;

export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: '입력값이 올바르지 않습니다', details: error.flatten() },
          { status: 400 }
        );
      }
      if (error instanceof AppError && error.isOperational) {
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode }
        );
      }
      console.error('Unexpected error:', error);
      return NextResponse.json(
        { error: '서버 내부 오류가 발생했습니다' },
        { status: 500 }
      );
    }
  };
}
```

#### 테스트 예시: 에러 클래스

```typescript
// __tests__/shared/lib/errors.test.ts
import { NotFoundError, ValidationError, UnauthorizedError } from '@/shared/lib/errors';

describe('AppError classes', () => {
  it('NotFoundError는 404와 올바른 메시지를 반환한다', () => {
    const error = new NotFoundError('Product', 'abc-123');

    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Product을(를) 찾을 수 없습니다: abc-123');
    expect(error.isOperational).toBe(true);
    expect(error).toBeInstanceOf(Error);
  });

  it('UnauthorizedError는 401을 반환한다', () => {
    const error = new UnauthorizedError();

    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('인증이 필요합니다');
  });
});
```

### 6. 검증 스키마 (Zod)

```typescript
// entities/product/schema.ts
import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, '상품명은 필수입니다').max(200),
  price: z.number().int('가격은 정수여야 합니다').positive('가격은 0보다 커야 합니다'),
  categoryId: z.string().uuid('올바른 카테고리 ID가 아닙니다'),
  description: z.string().max(2000).optional(),
  stock: z.number().int().nonnegative().default(0),
});

export const updateProductSchema = productSchema.partial();

export type CreateProductInput = z.infer<typeof productSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
```

#### 테스트 예시: Zod 스키마

```typescript
// __tests__/entities/product/schema.test.ts
import { productSchema } from '@/entities/product/schema';

describe('productSchema', () => {
  it('유효한 데이터를 통과시킨다', () => {
    const result = productSchema.safeParse({
      name: '테스트 상품',
      price: 29900,
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
      stock: 50,
    });

    expect(result.success).toBe(true);
  });

  it('빈 상품명은 거부한다', () => {
    const result = productSchema.safeParse({
      name: '',
      price: 10000,
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('상품명은 필수입니다');
    }
  });

  it('음수 가격은 거부한다', () => {
    const result = productSchema.safeParse({
      name: '상품',
      price: -1000,
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
    });

    expect(result.success).toBe(false);
  });

  it('잘못된 UUID 형식의 categoryId는 거부한다', () => {
    const result = productSchema.safeParse({
      name: '상품',
      price: 10000,
      categoryId: 'invalid-id',
    });

    expect(result.success).toBe(false);
  });
});
```

### 7. 캐싱 전략

```typescript
// shared/lib/cache.ts
import { unstable_cache } from 'next/cache';

export function cachedQuery<T>(
  fn: () => Promise<T>,
  keyParts: string[],
  options?: { revalidate?: number; tags?: string[] }
): Promise<T> {
  return unstable_cache(fn, keyParts, {
    revalidate: options?.revalidate ?? 3600,
    tags: options?.tags,
  })();
}

// 사용 예시
export async function getCachedProduct(id: string): Promise<Product | null> {
  return cachedQuery(
    () => productRepository.findById(id),
    ['product', id],
    { revalidate: 1800, tags: [`product-${id}`] }
  );
}
```

### 8. Rate Limiting

```typescript
// shared/lib/rate-limit.ts
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig = { windowMs: 60_000, maxRequests: 60 }
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1 };
  }

  entry.count++;
  const remaining = Math.max(0, config.maxRequests - entry.count);

  return { allowed: entry.count <= config.maxRequests, remaining };
}
```

## 작업 프로세스

### Step 1: 요구사항 → 테스트 케이스 도출

```markdown
## API: POST /api/orders (주문 생성)

### 테스트 케이스
- [ ] 정상: 유효한 데이터로 주문을 생성하고 201 반환
- [ ] 정상: 주문 생성 시 재고 차감
- [ ] 인증: 비로그인 사용자는 401 반환
- [ ] 검증: 빈 items 배열은 400 반환
- [ ] 검증: 음수 수량은 400 반환
- [ ] 비즈니스: 재고 부족 시 409 반환
- [ ] 비즈니스: 존재하지 않는 상품 ID는 404 반환
```

### Step 2: RED → GREEN → REFACTOR 반복

한 번에 하나의 테스트 케이스만 집중하여 사이클을 반복합니다.

### Step 3: 통합 검증

단위 테스트 완료 후 통합 테스트로 전체 흐름을 검증합니다.

## 사용 시점

- API Routes를 구현할 때
- Server Actions를 작성할 때
- 비즈니스 로직을 구현할 때
- 데이터 접근 계층(Repository)을 구현할 때
- 인증/인가 로직을 적용할 때
- 입력값 검증 스키마를 작성할 때
- 에러 처리 시스템을 설계할 때
- 외부 API 연동을 구현할 때
- 캐싱/성능 최적화가 필요할 때

## 주의사항

- **TDD 필수**: 모든 API/로직은 테스트를 먼저 작성합니다
- **입력값 검증**: 모든 외부 입력은 **Zod 스키마**로 서버 측에서 검증합니다
- **에러 처리**: `withErrorHandler`로 일관된 에러 응답 형식을 유지합니다
- **인증 확인**: 비공개 API는 항상 세션/토큰 검증을 먼저 수행합니다
- **타입 안전성**: `any` 사용 금지, 모든 데이터에 타입 정의
- **민감 정보**: 환경 변수로 관리, 응답에 절대 포함하지 않음
- **트랜잭션**: 다중 테이블 변경 시 반드시 트랜잭션 사용
- 데이터베이스전문가의 스키마와 **타입 정합성** 유지
- 아키텍처전문가의 계층 구조와 **의존성 방향** 준수
- 프론트엔드전문가에게 **일관된 API 응답 형식** 제공
