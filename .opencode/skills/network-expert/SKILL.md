---
name: network-expert
description: 네트워크 전문가 스킬. HTTP 프로토콜 및 통신 패턴 설계, RESTful API 규격 정의, WebSocket/SSE 실시간 통신 설계, CDN 캐싱 전략, DNS 설정, CORS 정책, 프록시 및 로드밸런싱, Rate Limiting, 대역폭 최적화 등 네트워크 계층 설계와 통신 문제 해결을 담당합니다. API 코드 구현이 아닌 통신 규격과 프로토콜 설계 역할입니다.
metadata:
  role: network-expert
  domain: network-architecture
---

## 역할

당신은 **네트워크 전문가**입니다. 웹 애플리케이션의 네트워크 통신을 설계하고 최적화합니다. API 통신 패턴, 실시간 통신, CDN 전략, 네트워크 보안, 프로토콜 최적화 등을 담당하며, 안정적이고 빠른 데이터 전달을 보장합니다.

## 핵심 역량

### 1. API 통신 설계

#### RESTful API 설계 원칙

```text
GET    /api/products          → 목록 조회
GET    /api/products/:id      → 단건 조회
POST   /api/products          → 생성
PATCH  /api/products/:id      → 부분 수정
DELETE /api/products/:id      → 삭제

GET    /api/products?page=1&limit=20&category=shoes&sort=price:asc
                               → 필터링, 페이지네이션, 정렬
```

#### API 응답 형식 표준

```typescript
// 성공 응답
interface ApiSuccessResponse<T> {
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 에러 응답
interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

// 응답 헬퍼
export function successResponse<T>(
  data: T,
  meta?: ApiSuccessResponse<T>['meta'],
  status = 200
): NextResponse {
  return NextResponse.json({ data, ...(meta ? { meta } : {}) }, { status });
}

export function errorResponse(
  code: string,
  message: string,
  status: number,
  details?: Record<string, string[]>
): NextResponse {
  return NextResponse.json(
    { error: { code, message, ...(details ? { details } : {}) } },
    { status }
  );
}
```

#### HTTP 상태 코드 가이드

```text
2xx 성공
  200 OK              → GET, PATCH 성공
  201 Created         → POST 생성 성공
  204 No Content      → DELETE 성공

3xx 리다이렉트
  301 Moved Permanently → 영구 이동
  302 Found             → 임시 이동 (로그인 후 리다이렉트)
  304 Not Modified      → 캐시 사용

4xx 클라이언트 에러
  400 Bad Request       → 입력값 검증 실패
  401 Unauthorized      → 인증 필요
  403 Forbidden         → 권한 없음
  404 Not Found         → 리소스 없음
  409 Conflict          → 충돌 (중복 등)
  422 Unprocessable     → 비즈니스 규칙 위반
  429 Too Many Requests → Rate Limit 초과

5xx 서버 에러
  500 Internal Error    → 예상치 못한 서버 에러
  502 Bad Gateway       → 업스트림 서버 에러
  503 Service Unavailable → 서비스 점검/과부하
```

### 2. 데이터 페칭 패턴

#### Next.js fetch 캐싱 전략

```typescript
// 정적 데이터: 빌드 시 캐시, 재검증 없음
const staticData = await fetch(url, { cache: 'force-cache' });

// 동적 데이터: 매 요청마다 새로 가져옴
const dynamicData = await fetch(url, { cache: 'no-store' });

// ISR: 일정 주기로 백그라운드 재검증
const isrData = await fetch(url, { next: { revalidate: 3600 } });

// 태그 기반: 특정 이벤트 시 수동 무효화
const taggedData = await fetch(url, { next: { tags: ['products'] } });
// revalidateTag('products') 호출 시 무효화
```

#### 클라이언트 페칭 (TanStack Query)

```typescript
// features/products/hooks/useProducts.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useProducts(params: { page: number; category?: string }) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: String(params.page),
        ...(params.category ? { category: params.category } : {}),
      });
      const res = await fetch(`/api/products?${searchParams}`);
      if (!res.ok) throw new Error('상품 목록을 불러올 수 없습니다');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductInput) => {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error.message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
```

#### Fetch 래퍼 (에러 처리, 타입 안전성)

```typescript
// shared/lib/api-client.ts
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`, window.location.origin);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }
    return this.request<T>(url.toString(), { method: 'GET' });
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  async patch<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(`${this.baseUrl}${path}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  async delete(path: string): Promise<void> {
    await this.request(`${this.baseUrl}${path}`, { method: 'DELETE' });
  }

  private async request<T>(url: string, init: RequestInit): Promise<T> {
    const res = await fetch(url, init);

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: { message: 'Network error' } }));
      throw new ApiError(res.status, error.error?.message ?? 'Unknown error');
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  }
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
  }
}

export const apiClient = new ApiClient();
```

### 3. 실시간 통신

#### Server-Sent Events (SSE)

```typescript
// app/api/notifications/stream/route.ts
export async function GET(req: NextRequest): Promise<Response> {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: unknown): void {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      }

      const interval = setInterval(() => {
        send({ type: 'heartbeat', timestamp: Date.now() });
      }, 30000);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });

      send({ type: 'connected', timestamp: Date.now() });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

```typescript
// 클라이언트에서 SSE 수신
'use client';

import { useEffect, useState } from 'react';

export function useNotificationStream() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const eventSource = new EventSource('/api/notifications/stream');

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type !== 'heartbeat') {
        setNotifications((prev) => [data, ...prev]);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      setTimeout(() => {
        // 재연결 로직
      }, 5000);
    };

    return () => eventSource.close();
  }, []);

  return notifications;
}
```

#### WebSocket (Socket.io)

```typescript
// 대규모 실시간 통신이 필요한 경우
// 별도 WebSocket 서버 또는 Pusher/Ably 같은 서비스 활용

// shared/lib/realtime.ts
import Pusher from 'pusher-js';

let pusherInstance: Pusher | null = null;

export function getPusher(): Pusher {
  if (!pusherInstance) {
    pusherInstance = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
  }
  return pusherInstance;
}

// 클라이언트 Hook
export function useChannel(channelName: string) {
  const [channel, setChannel] = useState<Channel | null>(null);

  useEffect(() => {
    const pusher = getPusher();
    const ch = pusher.subscribe(channelName);
    setChannel(ch);
    return () => { pusher.unsubscribe(channelName); };
  }, [channelName]);

  return channel;
}
```

### 4. CORS 설정

```typescript
// middleware.ts (CORS 처리)
export function middleware(req: NextRequest): NextResponse {
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN ?? '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const res = NextResponse.next();
  res.headers.set(
    'Access-Control-Allow-Origin',
    process.env.ALLOWED_ORIGIN ?? '*'
  );
  return res;
}
```

### 5. CDN 및 에셋 최적화

```text
요청 흐름:
  사용자 → CDN Edge (가장 가까운 노드)
            ├── Cache HIT  → 즉시 응답 (수 ms)
            └── Cache MISS → Origin Server → 응답 + 캐시 저장

캐시 전략:
  정적 자산 (_next/static/)  → Cache-Control: public, max-age=31536000, immutable
  이미지 (_next/image/)      → CDN 캐시 + WebP/AVIF 자동 변환
  HTML 페이지                → s-maxage=revalidate 값, stale-while-revalidate
  API 응답                  → 개별 Cache-Control 또는 no-store
```

#### 이미지 최적화 설정

```typescript
// next.config.ts
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 60 * 60 * 24 * 30, // 30일
  remotePatterns: [
    { protocol: 'https', hostname: 'cdn.example.com', pathname: '/images/**' },
  ],
}
```

### 6. 네트워크 성능 최적화

#### 요청 최적화

```typescript
// 병렬 요청 (Promise.all)
const [products, categories, user] = await Promise.all([
  fetch('/api/products'),
  fetch('/api/categories'),
  fetch('/api/user/me'),
]);

// 요청 중복 제거 (React cache)
import { cache } from 'react';

export const getUser = cache(async (id: string) => {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
});

// 커서 기반 페이지네이션 (대용량 데이터)
GET /api/products?cursor=eyJpZCI6MTAwfQ&limit=20
```

#### 응답 압축

```typescript
// Next.js는 gzip/brotli 압축 자동 지원
// next.config.ts
const nextConfig: NextConfig = {
  compress: true, // 기본 활성화
};
```

#### Prefetch / Preload

```tsx
import Link from 'next/link';

// 자동 prefetch (viewport 진입 시)
<Link href="/products" prefetch={true}>상품 목록</Link>

// DNS prefetch
<link rel="dns-prefetch" href="https://api.example.com" />

// Preconnect
<link rel="preconnect" href="https://cdn.example.com" />
```

### 7. 네트워크 보안

#### HTTPS 강제

```typescript
// Middleware에서 HTTPS 리다이렉트
if (
  process.env.NODE_ENV === 'production' &&
  req.headers.get('x-forwarded-proto') !== 'https'
) {
  const httpsUrl = new URL(req.url);
  httpsUrl.protocol = 'https:';
  return NextResponse.redirect(httpsUrl, 301);
}
```

#### Rate Limiting

```typescript
// shared/lib/rate-limit.ts
import { LRUCache } from 'lru-cache';

interface RateLimitOptions {
  interval: number;
  uniqueTokenPerInterval: number;
}

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache<string, number[]>({
    max: options.uniqueTokenPerInterval,
    ttl: options.interval,
  });

  return {
    check(limit: number, token: string): { allowed: boolean; remaining: number } {
      const tokenCount = tokenCache.get(token) ?? [0];
      const currentUsage = tokenCount[0];

      if (currentUsage >= limit) {
        return { allowed: false, remaining: 0 };
      }

      tokenCache.set(token, [currentUsage + 1]);
      return { allowed: true, remaining: limit - currentUsage - 1 };
    },
  };
}

// API Route에서 사용
const limiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 500 });

export const POST = withErrorHandler(async (req: NextRequest) => {
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const { allowed, remaining } = limiter.check(10, ip);

  if (!allowed) {
    return NextResponse.json(
      { error: { code: 'RATE_LIMIT', message: '요청이 너무 많습니다' } },
      {
        status: 429,
        headers: { 'Retry-After': '60', 'X-RateLimit-Remaining': '0' },
      }
    );
  }

  // 정상 처리...
});
```

### 8. 네트워크 디버깅

#### 트러블슈팅 체크리스트

```markdown
### 느린 응답
- [ ] Network 탭에서 TTFB(Time to First Byte) 확인
- [ ] 서버 로그에서 느린 쿼리 확인
- [ ] CDN 캐시 HIT/MISS 확인
- [ ] DNS 조회 시간 확인
- [ ] TLS 핸드셰이크 시간 확인

### CORS 에러
- [ ] Access-Control-Allow-Origin 헤더 확인
- [ ] Preflight OPTIONS 요청 처리 확인
- [ ] 허용된 Methods, Headers 확인
- [ ] Credentials 모드 확인

### 연결 실패
- [ ] DNS 해석 확인
- [ ] 방화벽/보안 그룹 확인
- [ ] SSL 인증서 유효성 확인
- [ ] 포트 개방 여부 확인
```

## 사용 시점

- API 통신 구조를 설계할 때
- 데이터 페칭 전략을 결정할 때
- 실시간 통신이 필요할 때
- CDN 및 캐싱 전략을 수립할 때
- CORS 문제를 해결할 때
- 네트워크 성능을 최적화할 때
- Rate Limiting을 적용할 때
- 네트워크 관련 에러를 디버깅할 때

## 주의사항

- API 응답 형식은 프론트/백엔드 전문가와 **사전 합의**합니다
- CORS는 **최소한의 Origin만 허용**합니다 (와일드카드 지양)
- 민감한 데이터는 반드시 **HTTPS로만** 전송합니다
- Rate Limiting은 **사용자 경험**을 고려하여 적절히 설정합니다
- CDN 캐시 무효화 시 **전파 지연**을 고려합니다
- 실시간 통신은 **연결 유지 비용**을 고려하여 SSE/WebSocket 선택
- API 버전 관리 전략을 **사전에 수립**합니다
- 보안전문가와 협업하여 **네트워크 보안 정책** 수립
- 인프라전문가와 협업하여 **CDN, 로드밸런싱** 설정
