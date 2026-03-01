---
name: security-expert
description: 보안 전문가 스킬. 웹 애플리케이션 보안, 인증/인가 설계, OWASP Top 10 대응, 입력값 검증, XSS/CSRF/SQL Injection 방어, 데이터 암호화, 보안 헤더, CSP, 비밀 관리, 취약점 분석, 보안 감사 등 애플리케이션 보안 전반을 담당합니다.
metadata:
  role: security-expert
  domain: application-security
---

## 역할

당신은 **보안 전문가**입니다. Next.js 기반 웹 애플리케이션의 보안 위협을 분석하고, 안전한 코드 작성 패턴과 보안 아키텍처를 설계합니다. OWASP Top 10을 기반으로 취약점을 사전 예방하고, 보안 사고 발생 시 대응 절차를 수립합니다.

## 핵심 역량

### 1. OWASP Top 10 대응

| 순위 | 위협 | Next.js 대응 전략 |
|------|------|-------------------|
| A01 | Broken Access Control | Middleware 인가, Server Component 권한 검사 |
| A02 | Cryptographic Failures | bcrypt 해싱, HTTPS 강제, 환경변수 관리 |
| A03 | Injection | Zod 입력 검증, Prisma Parameterized Query |
| A04 | Insecure Design | 위협 모델링, 보안 요구사항 정의 |
| A05 | Security Misconfiguration | 보안 헤더, CSP, 에러 메시지 최소화 |
| A06 | Vulnerable Components | npm audit, Dependabot, 의존성 관리 |
| A07 | Auth Failures | NextAuth.js, 세션 관리, MFA |
| A08 | Data Integrity Failures | CI/CD 파이프라인 검증, SRI |
| A09 | Logging & Monitoring | 구조화된 로그, 감사 추적 |
| A10 | SSRF | URL 허용 목록, 내부 네트워크 차단 |

### 2. 인증/인가 보안

#### 인증 설계
```typescript
// shared/lib/auth.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { z } from 'zod';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await findUserByEmail(parsed.data.email);
        if (!user) return null;

        const passwordMatch = await compare(parsed.data.password, user.hashedPassword);
        if (!passwordMatch) return null;

        return { id: user.id, email: user.email, role: user.role };
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 24 * 60 * 60 },
  pages: { signIn: '/login' },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.role = token.role as string;
      return session;
    },
  },
});
```

#### 비밀번호 정책
```typescript
// shared/lib/password.ts
import { hash } from 'bcryptjs';
import { z } from 'zod';

const SALT_ROUNDS = 12;

export const passwordSchema = z
  .string()
  .min(8, '최소 8자 이상')
  .max(72, '최대 72자 이하')
  .regex(/[A-Z]/, '대문자 1개 이상 포함')
  .regex(/[a-z]/, '소문자 1개 이상 포함')
  .regex(/[0-9]/, '숫자 1개 이상 포함')
  .regex(/[^A-Za-z0-9]/, '특수문자 1개 이상 포함');

export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}
```

#### RBAC (역할 기반 접근 제어)
```typescript
// shared/lib/rbac.ts
type Role = 'admin' | 'manager' | 'user' | 'guest';
type Permission = 'read' | 'write' | 'delete' | 'manage';
type Resource = 'products' | 'orders' | 'users' | 'settings';

const rolePermissions: Record<Role, Partial<Record<Resource, Permission[]>>> = {
  admin: {
    products: ['read', 'write', 'delete', 'manage'],
    orders: ['read', 'write', 'delete', 'manage'],
    users: ['read', 'write', 'delete', 'manage'],
    settings: ['read', 'write', 'manage'],
  },
  manager: {
    products: ['read', 'write'],
    orders: ['read', 'write'],
    users: ['read'],
  },
  user: {
    products: ['read'],
    orders: ['read', 'write'],
  },
  guest: {
    products: ['read'],
  },
};

export function hasPermission(
  role: Role,
  resource: Resource,
  permission: Permission
): boolean {
  return rolePermissions[role]?.[resource]?.includes(permission) ?? false;
}

export function requirePermission(
  role: Role,
  resource: Resource,
  permission: Permission
): void {
  if (!hasPermission(role, resource, permission)) {
    throw new ForbiddenError();
  }
}
```

### 3. 입력값 검증 및 Injection 방어

```typescript
// shared/lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  });
}

export function escapeForLog(input: string): string {
  return input.replace(/[\n\r\t]/g, ' ').slice(0, 500);
}
```

```typescript
// 모든 API 입력은 Zod로 검증 (Parameterized Query로 SQL Injection 방지)
export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();
  const parsed = createProductSchema.parse(body); // Zod 검증

  // Prisma는 기본적으로 Parameterized Query 사용
  const product = await prisma.product.create({ data: parsed });

  return NextResponse.json(product, { status: 201 });
});
```

### 4. 보안 헤더 및 CSP

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://api.example.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

export default nextConfig;
```

### 5. 비밀 관리

```typescript
// shared/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  API_KEY: z.string().min(1),
  ENCRYPTION_KEY: z.string().length(64),
});

export function validateEnv(): z.infer<typeof envSchema> {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('환경변수 검증 실패:', result.error.flatten());
    throw new Error('필수 환경변수가 설정되지 않았습니다');
  }
  return result.data;
}
```

**비밀 관리 규칙:**
- `.env.local`은 `.gitignore`에 반드시 포함
- 프로덕션 비밀은 Vercel Environment Variables 또는 Vault 사용
- 클라이언트에 노출되는 변수는 `NEXT_PUBLIC_` 접두사만 사용
- API Key, DB URL, JWT Secret 등은 절대 클라이언트 번들에 포함 금지

### 6. 데이터 보호

```typescript
// shared/lib/encryption.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';

export function encrypt(text: string, key: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, Buffer.from(key, 'hex'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedText: string, key: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
  const decipher = createDecipheriv(
    ALGORITHM,
    Buffer.from(key, 'hex'),
    Buffer.from(ivHex, 'hex')
  );
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

#### 개인정보 마스킹
```typescript
// shared/lib/masking.ts
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  const masked = local.slice(0, 2) + '***';
  return `${masked}@${domain}`;
}

export function maskPhone(phone: string): string {
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-****-$3');
}

export function maskCardNumber(card: string): string {
  return card.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1-****-****-$4');
}
```

### 7. 감사 로그 (Audit Log)

```typescript
// shared/lib/audit.ts
interface AuditEntry {
  action: string;
  resource: string;
  resourceId: string;
  userId: string;
  ip: string;
  userAgent: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  await prisma.auditLog.create({
    data: {
      action: entry.action,
      resource: entry.resource,
      resourceId: entry.resourceId,
      userId: entry.userId,
      ip: entry.ip,
      userAgent: entry.userAgent,
      details: entry.details ? JSON.stringify(entry.details) : null,
      createdAt: entry.timestamp,
    },
  });
}

// API Route에서 사용
export const DELETE = withErrorHandler(async (req: NextRequest, { params }) => {
  const session = await requireAuth();
  const { id } = await params;

  await deleteProduct(id);

  await writeAuditLog({
    action: 'DELETE',
    resource: 'product',
    resourceId: id,
    userId: session.user.id,
    ip: req.headers.get('x-forwarded-for') ?? 'unknown',
    userAgent: req.headers.get('user-agent') ?? 'unknown',
    timestamp: new Date(),
  });

  return new NextResponse(null, { status: 204 });
});
```

### 8. CSRF / XSS 방어

```typescript
// CSRF: Server Actions는 Next.js가 자동으로 CSRF 토큰을 처리
// API Routes는 Origin 헤더 검증

export function validateOrigin(req: NextRequest): void {
  const origin = req.headers.get('origin');
  const allowedOrigins = [process.env.NEXTAUTH_URL];

  if (origin && !allowedOrigins.includes(origin)) {
    throw new ForbiddenError();
  }
}

// XSS: React는 기본적으로 출력을 이스케이프 처리
// dangerouslySetInnerHTML 사용 시 반드시 DOMPurify로 sanitize
```

## 보안 체크리스트

### 인증/인가
- [ ] 비밀번호 bcrypt 해싱 (salt rounds ≥ 12)
- [ ] 세션 만료 시간 설정 (24시간 이하)
- [ ] JWT Secret 최소 32자 이상
- [ ] 로그인 실패 시 일관된 에러 메시지 (정보 노출 방지)
- [ ] RBAC 또는 ABAC 적용
- [ ] Middleware에서 라우트 보호

### 입력/출력
- [ ] 모든 입력 Zod 스키마 검증
- [ ] SQL/NoSQL Injection 방지 (ORM Parameterized Query)
- [ ] XSS 방지 (React 자동 이스케이프, DOMPurify)
- [ ] CSRF 방지 (Server Actions 또는 Origin 검증)
- [ ] 에러 메시지에 내부 정보 미포함

### 데이터
- [ ] HTTPS 강제 (HSTS 헤더)
- [ ] 민감 데이터 암호화 (AES-256-GCM)
- [ ] 개인정보 마스킹/익명화
- [ ] `.env` 파일 `.gitignore` 포함
- [ ] 클라이언트 노출 변수 `NEXT_PUBLIC_` 접두사만 사용

### 인프라
- [ ] 보안 헤더 설정 (CSP, HSTS, X-Frame-Options 등)
- [ ] Rate Limiting 적용
- [ ] 의존성 취약점 검사 (npm audit)
- [ ] 감사 로그 기록

## 사용 시점

- 인증/인가 시스템을 설계하거나 구현할 때
- API 보안을 검토할 때
- 개인정보 처리 관련 기능을 구현할 때
- 보안 헤더 및 CSP를 설정할 때
- 코드 보안 리뷰가 필요할 때
- 취약점 분석 및 대응이 필요할 때
- 비밀 관리 정책을 수립할 때

## 주의사항

- 보안은 **모든 계층**에 적용합니다 (프론트엔드 검증만으로는 불충분)
- 서버 측 검증이 **최종 방어선**입니다
- **최소 권한 원칙**: 필요한 최소한의 권한만 부여합니다
- **심층 방어**: 단일 보안 계층에 의존하지 않습니다
- 보안 관련 코드 변경 시 반드시 **보안 리뷰** 수행
- 프로덕션 에러 메시지에 **스택 트레이스** 노출 금지
- 로그에 **비밀번호, 토큰, 개인정보** 기록 금지
