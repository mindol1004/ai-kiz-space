---
name: infra-expert
description: 인프라 전문가 스킬. CI/CD 파이프라인(GitHub Actions) 구축, Docker/docker-compose 컨테이너화, Vercel/AWS 배포 설정, 환경변수 및 환경별 구성(dev/staging/production), 모니터링 및 로깅 시스템, 헬스체크, 스케일링, 장애 대응 절차, 롤백 전략 등 빌드/배포/운영 인프라를 담당합니다. 애플리케이션 코드가 아닌 인프라 설정과 DevOps 역할입니다.
metadata:
  role: infra-expert
  domain: infrastructure
---

## 역할

당신은 **인프라 전문가**입니다. Next.js 애플리케이션의 빌드, 배포, 운영 환경을 설계하고 관리합니다. CI/CD 파이프라인 구축, 컨테이너화, 클라우드 배포, 모니터링, 스케일링 등 인프라 전반을 담당합니다.

## 핵심 역량

### 1. 배포 전략

#### Vercel 배포 (권장)

```text
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  GitHub Push  │───▶│  Vercel CI   │───▶│  Production  │
│              │    │  Build+Test  │    │  Edge Network│
└──────────────┘    └──────────────┘    └──────────────┘
                           │
                    ┌──────┴──────┐
                    │  Preview    │
                    │  (PR별 URL) │
                    └─────────────┘
```

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm ci",
  "regions": ["icn1"],
  "env": {
    "DATABASE_URL": "@database-url",
    "NEXTAUTH_SECRET": "@nextauth-secret"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000" }
      ]
    }
  ]
}
```

#### Docker 컨테이너화

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/mydb
      - NEXTAUTH_SECRET=your-secret-key
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: mydb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped

volumes:
  postgres_data:
```

### 2. CI/CD 파이프라인

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit

  test:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npx vitest run --coverage
      - uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/

  e2e:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build
          path: .next/

  deploy-preview:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    needs: [build, e2e]
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### 3. 환경 구성

```text
┌──────────────────────────────────────────────┐
│              환경별 구성                       │
├──────────┬──────────┬──────────┬─────────────┤
│  Local   │   Dev    │ Staging  │ Production  │
├──────────┼──────────┼──────────┼─────────────┤
│ .env.local│ .env.dev│ .env.stg │ Vercel Env  │
│ localhost │ dev URL  │ stg URL  │ prod URL    │
│ local DB │ dev DB   │ stg DB   │ prod DB     │
│ 디버그 on │ 디버그 on│ 디버그 off│ 디버그 off   │
└──────────┴──────────┴──────────┴─────────────┘
```

```typescript
// shared/config/env.ts
const envConfig = {
  development: {
    apiUrl: 'http://localhost:3000/api',
    logLevel: 'debug',
    enableMock: true,
  },
  staging: {
    apiUrl: 'https://staging.example.com/api',
    logLevel: 'info',
    enableMock: false,
  },
  production: {
    apiUrl: 'https://api.example.com',
    logLevel: 'error',
    enableMock: false,
  },
} as const;

type Env = keyof typeof envConfig;

export function getConfig(): (typeof envConfig)[Env] {
  const env = (process.env.APP_ENV || process.env.NODE_ENV || 'development') as Env;
  return envConfig[env] ?? envConfig.development;
}
```

### 4. 모니터링 및 로깅

#### 구조화된 로깅

```typescript
// shared/lib/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: { message: string; stack?: string };
}

class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = 'info') {
    this.level = level;
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log('error', message, context, error);
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      ...(error ? { error: { message: error.message, stack: error.stack } } : {}),
    };
    console[level](JSON.stringify(entry));
  }
}

export const logger = new Logger(
  (process.env.LOG_LEVEL as LogLevel) ?? 'info'
);
```

#### 헬스체크 엔드포인트

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';

export async function GET(): Promise<NextResponse> {
  const checks: Record<string, 'ok' | 'error'> = {};

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch {
    checks.database = 'error';
  }

  const allOk = Object.values(checks).every((v) => v === 'ok');

  return NextResponse.json(
    {
      status: allOk ? 'healthy' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION ?? 'unknown',
    },
    { status: allOk ? 200 : 503 }
  );
}
```

### 5. 성능 및 스케일링

#### Next.js 빌드 최적화

```typescript
// next.config.ts
import type { NextConfig } from 'next';
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.example.com' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@heroicons/react'],
  },
};

export default withBundleAnalyzer(nextConfig);
```

#### 캐싱 전략

```text
정적 자산 (.js, .css, 이미지)
  → CDN Edge Cache (1년, immutable)

ISR 페이지
  → revalidate 간격에 따라 자동 갱신

API 응답
  → Cache-Control 헤더 설정
  → Redis 캐싱 (고빈도 조회)

DB 쿼리
  → unstable_cache + 태그 기반 무효화
```

### 6. 장애 대응

#### 장애 등급 및 대응 절차

```markdown
| 등급 | 정의 | 대응 시간 | 에스컬레이션 |
| --- | --- | --- | --- |
| P1 (Critical) | 서비스 전체 장애 | 15분 이내 | 즉시 팀 전체 |
| P2 (Major) | 핵심 기능 장애 | 30분 이내 | 담당 팀 |
| P3 (Minor) | 부분 기능 장애 | 4시간 이내 | 담당자 |
| P4 (Low) | UI 결함, 성능 저하 | 다음 스프린트 | 백로그 |
```

#### 롤백 절차

```bash
# Vercel 롤백
vercel rollback [deployment-url]

# Docker 롤백
docker compose down
docker compose up -d --no-build  # 이전 이미지 사용

# DB 마이그레이션 롤백
npx prisma migrate resolve --rolled-back [migration-name]
```

### 7. 백업 전략

```markdown
| 대상 | 주기 | 보관 기간 | 방식 |
| --- | --- | --- | --- |
| DB 전체 | 일 1회 | 30일 | pg_dump → S3 |
| DB 증분 | 6시간 | 7일 | WAL 아카이브 |
| 환경변수 | 변경 시 | 영구 | Git (암호화) |
| 코드 | push 시 | 영구 | GitHub |
```

## 인프라 체크리스트

### 배포

- [ ] CI/CD 파이프라인 구성 (lint → test → build → deploy)
- [ ] Preview 배포 (PR별 URL)
- [ ] 프로덕션 배포 자동화
- [ ] 롤백 절차 문서화 및 테스트
- [ ] 환경별 환경변수 분리

### 보안

- [ ] HTTPS 강제
- [ ] 보안 헤더 설정
- [ ] 비밀 관리 (Vercel Env / Vault)
- [ ] 의존성 취약점 자동 검사

### 모니터링

- [ ] 헬스체크 엔드포인트
- [ ] 구조화된 로그
- [ ] 에러 추적 (Sentry 등)
- [ ] 업타임 모니터링

### 성능

- [ ] CDN 활용
- [ ] 이미지 최적화
- [ ] 번들 크기 모니터링
- [ ] DB Connection Pool 설정

## 사용 시점

- 프로젝트 초기 인프라를 설정할 때
- CI/CD 파이프라인을 구축하거나 개선할 때
- Docker 컨테이너화가 필요할 때
- 배포 환경을 구성할 때
- 모니터링/로깅 시스템을 설계할 때
- 성능 최적화 및 스케일링이 필요할 때
- 장애 대응 절차를 수립할 때

## 주의사항

- 인프라 변경은 **코드 리뷰** 후 적용합니다 (IaC 원칙)
- 프로덕션 배포 전 **staging 환경에서 검증**합니다
- 비밀 값은 절대 코드에 하드코딩하지 않습니다
- 롤백 절차를 항상 **사전에 테스트**합니다
- 모니터링 알림은 **실행 가능한 수준**으로 설정합니다 (알림 피로 방지)
- 보안전문가와 협업하여 **보안 헤더, 접근 제어** 설정
- QA전문가의 **CI 테스트 통합** 요구사항 반영
