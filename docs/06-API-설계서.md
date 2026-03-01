# 키즈공간 API 설계서

> **작성 기준**: network-expert API 응답 형식 + backend-expert Repository 패턴/Error Handler + security-expert OWASP 대응/Rate Limiting
> **관련 스킬**: network-expert, backend-expert, security-expert, architecture-expert

---

## 1. API 설계 원칙

### 1.1 기본 규칙

| 항목 | 규칙 |
|------|------|
| **Base URL** | `/api` (Next.js App Router Route Handlers) |
| **인증** | NextAuth.js Session 기반, `getServerSession()` 검증 |
| **요청 형식** | `Content-Type: application/json` |
| **응답 형식** | 통일된 `ApiSuccessResponse` / `ApiErrorResponse` |
| **유효성 검증** | 서버측 Zod 스키마 필수 검증 (backend-expert) |
| **에러 처리** | `withErrorHandler` HOF로 통일 (backend-expert) |
| **보안** | CSRF 토큰, Rate Limiting, 입력 산화 (security-expert) |

### 1.2 공통 응답 형식

> **근거**: network-expert `ApiSuccessResponse` / `ApiErrorResponse` 형식

#### 성공 응답

```typescript
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasNext?: boolean;
    cursor?: string;
  };
}
```

#### 에러 응답

```typescript
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;        // 에러 코드 (예: "VALIDATION_ERROR")
    message: string;     // 사용자 표시 메시지
    details?: Record<string, string[]>;  // 필드별 에러 (유효성)
  };
}
```

### 1.3 HTTP 상태 코드

> **근거**: network-expert HTTP 상태 코드 가이드

| 코드 | 의미 | 사용 |
|------|------|------|
| 200 | OK | 조회 성공, 수정 성공 |
| 201 | Created | 리소스 생성 성공 |
| 204 | No Content | 삭제 성공 |
| 400 | Bad Request | Zod 유효성 검증 실패 |
| 401 | Unauthorized | 인증 필요 (세션 없음) |
| 403 | Forbidden | 권한 없음 (role 부족) |
| 404 | Not Found | 리소스 없음 |
| 409 | Conflict | 중복 데이터 (이메일, 닉네임 등) |
| 422 | Unprocessable Entity | 비즈니스 규칙 위반 (재고 부족 등) |
| 429 | Too Many Requests | Rate Limiting 초과 |
| 500 | Internal Server Error | 서버 오류 |

### 1.4 에러 처리 아키텍처

> **근거**: backend-expert `AppError` 계층, `withErrorHandler`

```typescript
// 에러 계층 구조
AppError (base)
├── ValidationError    (400) — Zod 검증 실패
├── AuthenticationError (401) — 인증 실패
├── AuthorizationError  (403) — 권한 부족
├── NotFoundError       (404) — 리소스 없음
├── ConflictError       (409) — 중복
├── BusinessRuleError   (422) — 비즈니스 규칙 위반
└── RateLimitError      (429) — Rate Limit 초과
```

```typescript
// Route Handler 패턴 (backend-expert)
export const GET = withErrorHandler(async (req: NextRequest) => {
  const session = await requireAuth();          // 401 자동 throw
  const data = await productRepository.findMany(params);
  return NextResponse.json({ success: true, data });
});
```

---

## 2. 인증/인가 미들웨어

> **근거**: backend-expert 인증/인가 패턴, security-expert RBAC

### 미들웨어 함수

| 함수 | 용도 | 실패 시 |
|------|------|---------|
| `requireAuth()` | 로그인 필수 확인 | 401 AuthenticationError |
| `requireRole(role)` | 역할 확인 (ADMIN, SUPER_ADMIN) | 403 AuthorizationError |
| `requireOwnership(userId)` | 본인 데이터 접근 확인 | 403 AuthorizationError |
| `withRateLimit(config)` | Rate Limiting | 429 RateLimitError |
| `withValidation(schema)` | Zod 스키마 검증 | 400 ValidationError |

---

## 3. Rate Limiting

> **근거**: network-expert Rate Limiting 정책, security-expert 보안 요구사항

| API 그룹 | 제한 | 기준 | 윈도우 |
|----------|------|------|--------|
| 인증 (로그인) | 5회 | IP | 1분 |
| 인증 (가입) | 3회 | IP | 1시간 |
| 일반 조회 (GET) | 100회 | IP | 1분 |
| 인증된 쓰기 (POST/PATCH/DELETE) | 30회 | 사용자 ID | 1분 |
| 검색 | 30회 | IP | 1분 |
| 이미지 업로드 | 20회 | 사용자 ID | 1분 |
| 관리자 | 200회 | 사용자 ID | 1분 |

**구현**: `lru-cache` 기반 In-Memory Rate Limiter (단일 인스턴스), 확장 시 Redis(Upstash)

**응답 헤더**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1709312400
```

---

## 4. 보안 헤더

> **근거**: security-expert 보안 헤더 설정

```typescript
// next.config.ts headers 또는 Middleware
{
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; ...",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
}
```

---

## 5. API 엔드포인트

### 5.1 인증 API

| 메서드 | URL | 설명 | 인증 | Rate Limit |
|--------|-----|------|------|------------|
| POST | `/api/auth/register` | 회원가입 | X | 3/시간/IP |
| POST | `/api/auth/[...nextauth]` | NextAuth.js (로그인/로그아웃/콜백) | X | 5/분/IP |
| POST | `/api/auth/forgot-password` | 비밀번호 찾기 | X | 3/시간/IP |
| POST | `/api/auth/reset-password` | 비밀번호 재설정 | X | 3/시간/IP |
| GET | `/api/auth/check-email` | 이메일 중복 확인 | X | 30/분/IP |
| GET | `/api/auth/check-nickname` | 닉네임 중복 확인 | X | 30/분/IP |

#### POST /api/auth/register

**Zod 스키마**:
```typescript
const registerSchema = z.object({
  email: z.string().email("올바른 이메일을 입력해주세요"),
  password: z.string().min(8).max(20).regex(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])/),
  name: z.string().min(2).max(20),
  nickname: z.string().min(2).max(15),
  phone: z.string().regex(/^010-\d{4}-\d{4}$/),
  agreeTerms: z.literal(true),
  agreePrivacy: z.literal(true),
  agreeMarketing: z.boolean().default(false),
});
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "email": "user@example.com",
    "nickname": "길동맘",
    "role": "USER",
    "grade": "BRONZE"
  }
}
```

**에러**:
- 409: `{ "code": "CONFLICT", "message": "이미 가입된 이메일입니다." }`
- 400: `{ "code": "VALIDATION_ERROR", "details": { "password": ["..."] } }`

---

### 5.2 사용자 API

| 메서드 | URL | 설명 | 인증 |
|--------|-----|------|------|
| GET | `/api/users/me` | 내 프로필 조회 | USER |
| PATCH | `/api/users/me` | 프로필 수정 | USER |
| DELETE | `/api/users/me` | 회원 탈퇴 | USER (비밀번호 재확인) |
| POST | `/api/users/me/children` | 자녀 정보 추가 | USER |
| PATCH | `/api/users/me/children/[childId]` | 자녀 정보 수정 | USER + 본인 |
| DELETE | `/api/users/me/children/[childId]` | 자녀 정보 삭제 | USER + 본인 |
| GET | `/api/users/me/addresses` | 배송지 목록 | USER |
| POST | `/api/users/me/addresses` | 배송지 추가 | USER |
| PATCH | `/api/users/me/addresses/[id]` | 배송지 수정 | USER + 본인 |
| DELETE | `/api/users/me/addresses/[id]` | 배송지 삭제 | USER + 본인 |
| PATCH | `/api/users/me/addresses/[id]/default` | 기본 배송지 설정 | USER + 본인 |

---

### 5.3 상품 API

| 메서드 | URL | 설명 | 인증 |
|--------|-----|------|------|
| GET | `/api/products` | 상품 목록 | X |
| GET | `/api/products/[id]` | 상품 상세 | X |
| GET | `/api/products/[id]/reviews` | 상품 리뷰 목록 | X |
| POST | `/api/products/[id]/reviews` | 리뷰 작성 | USER (구매확정) |
| PATCH | `/api/products/[id]/reviews/[reviewId]` | 리뷰 수정 | USER + 본인 |
| DELETE | `/api/products/[id]/reviews/[reviewId]` | 리뷰 삭제 | USER + 본인 |
| GET | `/api/products/search/suggestions` | 검색 자동완성 | X |

#### GET /api/products

**Query Parameters**:

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| page | number | 1 | 페이지 (1-based) |
| limit | number | 20 | 페이지당 개수 (max: 100) |
| category | string | - | 카테고리 slug |
| brand | string | - | 브랜드 slug (콤마 구분 복수) |
| minPrice | number | - | 최소 가격 |
| maxPrice | number | - | 최대 가격 |
| ageGroup | string | - | 연령대 enum |
| sort | string | "recommended" | 정렬 (recommended, latest, bestselling, price_asc, price_desc, rating, reviews) |
| freeShipping | boolean | - | 무료배송 필터 |
| onSale | boolean | - | 할인 상품 필터 |
| q | string | - | 검색 키워드 (DOMPurify 산화) |

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxx",
      "name": "교육완구 블록세트",
      "slug": "educational-block-set",
      "price": 35000,
      "salePrice": 25000,
      "thumbnail": "https://cdn.kidsspace.com/...",
      "brandName": "브랜드A",
      "categoryName": "교육완구",
      "avgRating": 4.5,
      "reviewCount": 128,
      "ageGroup": "AGE_3_5",
      "status": "ACTIVE"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 156, "hasNext": true }
}
```

---

### 5.4 카테고리 API

| 메서드 | URL | 설명 | 인증 |
|--------|-----|------|------|
| GET | `/api/categories` | 전체 카테고리 트리 | X |

**Response**: 중첩 트리 구조 (children 배열 포함)

---

### 5.5 장바구니 API

| 메서드 | URL | 설명 | 인증 |
|--------|-----|------|------|
| GET | `/api/cart` | 장바구니 조회 | USER |
| POST | `/api/cart` | 장바구니 추가 | USER |
| PATCH | `/api/cart/[id]` | 수량/옵션 변경 | USER + 본인 |
| DELETE | `/api/cart/[id]` | 개별 삭제 | USER + 본인 |
| DELETE | `/api/cart` | 선택 삭제 (body: itemIds[]) | USER |

#### GET /api/cart — Response (200)

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clcart1",
        "product": {
          "id": "clprod1",
          "name": "교육완구 블록세트",
          "thumbnail": "https://...",
          "price": 35000,
          "salePrice": 25000,
          "status": "ACTIVE"
        },
        "option": { "id": "clopt1", "name": "빨강", "additionalPrice": 0, "stock": 15 },
        "quantity": 2
      }
    ],
    "summary": {
      "totalItems": 3,
      "totalAmount": 75000,
      "discountAmount": 10000,
      "shippingFee": 0,
      "finalAmount": 65000
    }
  }
}
```

---

### 5.6 주문 API

| 메서드 | URL | 설명 | 인증 |
|--------|-----|------|------|
| POST | `/api/orders` | 주문 생성 (재고 차감, 트랜잭션) | USER |
| POST | `/api/orders/[id]/confirm-payment` | 결제 확인 (PG 검증) | USER + 본인 |
| GET | `/api/orders` | 내 주문 목록 | USER |
| GET | `/api/orders/[id]` | 주문 상세 | USER + 본인 |
| POST | `/api/orders/[id]/cancel` | 주문 취소 | USER + 본인 |
| POST | `/api/orders/[id]/return` | 반품 신청 | USER + 본인 |
| POST | `/api/orders/[id]/exchange` | 교환 신청 | USER + 본인 |
| POST | `/api/orders/[id]/confirm` | 구매 확정 | USER + 본인 |

#### POST /api/orders — 주문 생성

**보안 처리 (security-expert)**:
1. 서버에서 상품 가격/재고 재조회 (클라이언트 데이터 불신)
2. DB 트랜잭션 내 `SELECT FOR UPDATE`로 재고 동시성 제어
3. 결제 금액 서버 재계산 후 PG 요청 금액과 대조
4. `paymentKey` 서버측 PG API로 검증

**Request Body**:
```json
{
  "items": [{ "cartItemId": "clcart1" }],
  "addressId": "claddr1",
  "shippingMemo": "문 앞에 놔주세요",
  "couponId": "clcoup1",
  "pointUsed": 1000,
  "paymentMethod": "CARD"
}
```

---

### 5.7 위시리스트 API

| 메서드 | URL | 설명 | 인증 |
|--------|-----|------|------|
| GET | `/api/wishlist` | 위시리스트 조회 | USER |
| POST | `/api/wishlist` | 추가 (body: productId) | USER |
| DELETE | `/api/wishlist/[productId]` | 제거 | USER |

---

### 5.8 커뮤니티 API

| 메서드 | URL | 설명 | 인증 |
|--------|-----|------|------|
| GET | `/api/posts` | 게시글 목록 | X |
| GET | `/api/posts/[id]` | 게시글 상세 | X |
| POST | `/api/posts` | 게시글 작성 | USER |
| PATCH | `/api/posts/[id]` | 게시글 수정 | USER + 본인 |
| DELETE | `/api/posts/[id]` | 게시글 삭제 | USER + 본인 |
| POST | `/api/posts/[id]/like` | 좋아요 토글 | USER |
| POST | `/api/posts/[id]/bookmark` | 북마크 토글 | USER |
| POST | `/api/posts/[id]/report` | 신고 | USER |
| GET | `/api/posts/[id]/comments` | 댓글 목록 | X |
| POST | `/api/posts/[id]/comments` | 댓글 작성 | USER |
| PATCH | `/api/posts/[id]/comments/[commentId]` | 댓글 수정 | USER + 본인 |
| DELETE | `/api/posts/[id]/comments/[commentId]` | 댓글 삭제 | USER + 본인 |
| POST | `/api/posts/[id]/comments/[commentId]/like` | 댓글 좋아요 | USER |
| POST | `/api/posts/[id]/comments/[commentId]/accept` | 답변 채택 | USER + 글작성자 |

**게시글 본문 보안**: `content`는 서버에서 `DOMPurify.sanitize()` 후 저장 (security-expert)

---

### 5.9 알림 API

| 메서드 | URL | 설명 | 인증 |
|--------|-----|------|------|
| GET | `/api/notifications` | 알림 목록 | USER |
| PATCH | `/api/notifications/[id]/read` | 읽음 처리 | USER + 본인 |
| PATCH | `/api/notifications/read-all` | 전체 읽음 | USER |
| DELETE | `/api/notifications/[id]` | 알림 삭제 | USER + 본인 |

---

### 5.10 쿠폰/포인트 API

| 메서드 | URL | 설명 | 인증 |
|--------|-----|------|------|
| GET | `/api/users/me/coupons` | 내 쿠폰 목록 | USER |
| GET | `/api/users/me/coupons/available` | 사용 가능 쿠폰 (query: orderAmount) | USER |
| GET | `/api/users/me/points` | 포인트 잔액 + 이력 | USER |

---

### 5.11 기획전/배너/공지 API

| 메서드 | URL | 설명 | 인증 |
|--------|-----|------|------|
| GET | `/api/exhibitions` | 기획전 목록 | X |
| GET | `/api/exhibitions/[id]` | 기획전 상세 (포함 상품) | X |
| GET | `/api/banners` | 배너 목록 (query: position) | X |
| GET | `/api/notices` | 공지사항 목록 | X |
| GET | `/api/notices/[id]` | 공지사항 상세 | X |
| GET | `/api/faq` | FAQ 목록 (query: category) | X |

---

### 5.12 이미지 업로드 API

| 메서드 | URL | 설명 | 인증 |
|--------|-----|------|------|
| POST | `/api/upload` | Presigned URL 발급 | USER |

**Request**: `{ "fileName": "photo.jpg", "fileType": "image/jpeg", "category": "review" }`

**Response**: `{ "uploadUrl": "https://s3...", "fileUrl": "https://cdn..." }`

**보안 (security-expert)**:
- 파일 확장자/MIME 타입 서버 검증
- 카테고리별 크기 제한 (profile: 5MB, product/review/post: 10MB)
- 허용 형식: JPG, PNG, WebP (post만 GIF 추가)
- Presigned URL 만료: 10분

---

## 6. 관리자 API

> 모든 관리자 API는 `/api/admin` 접두사, `requireRole('ADMIN')` 미들웨어 적용

### 6.1 대시보드

| 메서드 | URL | 설명 |
|--------|-----|------|
| GET | `/api/admin/dashboard` | 대시보드 통계 |

### 6.2 상품 관리

| 메서드 | URL | 설명 |
|--------|-----|------|
| GET | `/api/admin/products` | 상품 목록 (관리용, 검색/필터/상태 포함) |
| POST | `/api/admin/products` | 상품 등록 |
| GET | `/api/admin/products/[id]` | 상품 상세 |
| PATCH | `/api/admin/products/[id]` | 상품 수정 |
| DELETE | `/api/admin/products/[id]` | 상품 삭제 |
| PATCH | `/api/admin/products/[id]/status` | 상태 변경 (ACTIVE/HIDDEN/SOLDOUT) |

### 6.3 주문 관리

| 메서드 | URL | 설명 |
|--------|-----|------|
| GET | `/api/admin/orders` | 주문 목록 |
| GET | `/api/admin/orders/[id]` | 주문 상세 |
| PATCH | `/api/admin/orders/[id]/status` | 상태 변경 |
| PATCH | `/api/admin/orders/[id]/tracking` | 운송장 입력 |

### 6.4 회원 관리

| 메서드 | URL | 설명 |
|--------|-----|------|
| GET | `/api/admin/users` | 회원 목록 |
| GET | `/api/admin/users/[id]` | 회원 상세 |
| PATCH | `/api/admin/users/[id]/grade` | 등급 변경 |
| PATCH | `/api/admin/users/[id]/status` | 상태 변경 (정지/복원) |

### 6.5 게시글/리뷰/쿠폰/배너/기획전/통계

| 메서드 | URL | 설명 |
|--------|-----|------|
| GET | `/api/admin/posts` | 게시글 목록 |
| DELETE | `/api/admin/posts/[id]` | 삭제 |
| PATCH | `/api/admin/posts/[id]/blind` | 블라인드 |
| GET | `/api/admin/reviews` | 리뷰 목록 |
| PATCH | `/api/admin/reviews/[id]/status` | 리뷰 상태 변경 |
| POST | `/api/admin/categories` | 카테고리 생성 |
| PATCH | `/api/admin/categories/[id]` | 수정 |
| PATCH | `/api/admin/categories/reorder` | 순서 변경 |
| POST | `/api/admin/coupons` | 쿠폰 생성 |
| POST | `/api/admin/coupons/issue` | 쿠폰 발급 |
| POST | `/api/admin/exhibitions` | 기획전 생성 |
| PATCH | `/api/admin/exhibitions/[id]` | 수정 |
| POST | `/api/admin/banners` | 배너 생성 |
| PATCH | `/api/admin/banners/[id]` | 수정 |
| DELETE | `/api/admin/banners/[id]` | 삭제 |
| GET | `/api/admin/analytics/revenue` | 매출 통계 |
| GET | `/api/admin/analytics/users` | 회원 통계 |
| GET | `/api/admin/analytics/products` | 상품 통계 |

**감사 로그**: 모든 관리자 CUD 작업은 AuditLog에 자동 기록 (backend-expert Middleware)

---

## 7. 데이터 페칭 전략

> **근거**: network-expert 데이터 페칭, frontend-expert TanStack Query + Server fetch

| 페이지 | 서버 페칭 | 클라이언트 페칭 |
|--------|-----------|----------------|
| 홈 | Server Component fetch (ISR 60s) | React Query: 연령별 추천 탭 전환 |
| 상품 목록 | Server Component fetch (SSR, no-store) | React Query: 필터/정렬/무한스크롤 |
| 상품 상세 | Server Component fetch (ISR 300s) | React Query: 리뷰 탭 (staleTime: 60s) |
| 게시판 목록 | Server Component fetch (SSR) | React Query: 페이지네이션 |
| 게시글 상세 | Server Component fetch (ISR 60s) | React Query: 댓글 (refetchOnFocus) |
| 장바구니 | - | React Query + Zustand 동기화 |
| 마이페이지 | - | React Query (staleTime: 30s) |
| 관리자 | - | React Query (staleTime: 0, 항상 최신) |

### React Query 기본 설정

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,      // 1분
      gcTime: 5 * 60 * 1000,     // 5분
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error) => toast.error(error.message),
    },
  },
});
```

---

## 8. CORS 설정

> **근거**: network-expert CORS 설계

```typescript
// next.config.ts
{
  async headers() {
    return [{
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: process.env.ALLOWED_ORIGIN },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PATCH,DELETE,OPTIONS' },
        { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        { key: 'Access-Control-Max-Age', value: '86400' },
      ],
    }];
  },
}
```
