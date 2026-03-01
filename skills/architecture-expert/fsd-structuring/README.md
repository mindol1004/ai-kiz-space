# FSD Structuring Skill (Feature-Sliced Design 구조 설계)

## 역할
- Feature-Sliced Design 아키텍처 적용
- 디렉토리 구조 설계 (layers: app, pages, widgets, features, entities, shared)
- Public API 설계 (모듈 경계)
- Import path 규칙 수립

## 파라미터
- `framework` (string, required): 'nextjs', 'react', 'vue'
- `projectScale` (string, optional): 'small', 'medium', 'large', 기본값 'medium'
- `enforceLayers` (boolean, optional): 엄격한 레이어 분리 여부, 기본값 true
- `customLayers` (array, optional): 추가할 커스텀 레이어

## 의존성
- `domain-modeling` (선행 권장): 도메인 모델이 먼저 정의되어야 entities 레이어 구성 가능

## 출력
```typescript
{
  fsdStructure: {
    directoryTree: `
src/
├── app/
│   ├── (public)/
│   ├── (secure)/
│   └── layout.tsx
├── widgets/
│   ├── Header/
│   ├── Footer/
│   └── Navigation/
├── features/
│   ├── auth/
│   ├── cart/
│   └── orders/
├── entities/
│   ├── Product/
│   ├── Order/
│   └── User/
├── shared/
│   ├── ui/
│   ├── lib/
│   └── config/
└── public/
    `,
    layerRules: {
      app: {
        description: 'Routing segments, layouts, providers',
        allowedDeps: ['widgets', 'features', 'entities', 'shared'],
        export: 'public API only'
      },
      widgets: {
        description: 'Composite UI blocks',
        allowedDeps: ['features', 'entities', 'shared'],
        export: 'index.ts'
      },
      features: {
        description: 'Business features (useCases)',
        allowedDeps: ['entities', 'shared'],
        export: 'model/, entities/, widgets/'
      },
      entities: {
        description: 'DDD entities, business logic',
        allowedDeps: ['shared'],
        export: 'index.ts'
      },
      shared: {
        description: 'Reusable code (no business logic)',
        allowedDeps: [],
        export: 'public API only'
      }
    }
  },
  publicApiRules: {
    indexExport: true,
    barrelFiles: true,
    barrelType: 'index.ts',
    allowedImports: {
      'widgets/Header': ['shared/ui'],
      'features/cart': ['entities/Cart', 'shared/lib'],
      'entities/Product': ['shared/types']
    }
  },
  codeExamples: {
    featureStructure: 'features/auth/ 구조 예시',
    entityStructure: 'entities/Order/ 구조 예시',
    sharedStructure: 'shared/ui/Button/ 구조 예시'
  },
  migrationGuide: {
    fromMonolith: '단계별 마이그레이션 전략',
    refactoringSteps: [...]
  }
}
```

## 사용 예시
"Next.js 프로젝트를 FSD로 구조화해줘" → framework='nextjs', projectScale='medium'

## 레이어 상세

### 1. app/ - 애플리케이션 진입점
```
src/app/
├── (public)/              # Public 세그먼트 (인증 불필요)
│   ├── page.tsx          # 홈페이지
│   ├── layout.tsx
│   └── about/
├── (secure)/              # Secure 세그먼트 (인증 required)
│   ├── dashboard/
│   ├── profile/
│   └── layout.tsx
└── layout.tsx             # 루트 레이아웃
```
**포함:**
- Next.js App Router segments
- Providers (Theme, Auth, QueryClient)
- Global layout

**주의:**
- 비즈니스 로직 없음
- Providers만
- `auth/` 관련 props 전달은 세밀하게

### 2. pages/ - 페이지 (App Router에서는 app/에 통합)
```typescript
// App Router 사용 시: app/(public)/page.tsx
// Pages Router 사용 시: pages/index.tsx
```
**역할:** UI 컴포넌트 조합, SEO metadata, route handlers

### 3. widgets/ - 위젯 (UI 블록)
```
src/widgets/Header/
├── model/          # 위젯 관련 로직 (선택적)
│   ├── useHeader.ts
│   └── header.model.ts
├── ui/             # UI 컴포넌트
│   ├── Header.tsx
│   ├── Header.module.css
│   └── index.ts
├── config/         # 위젯 설정
│   └── links.ts
├── widget.tsx      # 위젯 진입점
└── index.ts        # Public API
```
**포함:** Header, Footer, Sidebar, SearchBar, Card, Modal

**규칙:**
- 재사용 가능한 단위
- 비즈니스 로직 최소화 (features로 위임)
- 올바른 분리: Header ↔ Header model (해야 하는 일과 UI의 분리)

### 4. features/ - 기능 (비즈니스 로직)
```
src/features/auth/
├── model/          # 비즈니스 로직
│   ├── useAuth.ts
│   ├── auth.slice.ts (Redux)
│   └── types.ts
├── widgets/        # 기능 특화 UI
│   ├── LoginForm/
│   ├── RegisterForm/
│   └── ProfileCard/
├── entities/       # 기능 관련 엔티티 참조
│   └── User/
├── lib/            # 외부 연동
│   └── auth-api.ts
├── config/         # 설정
│   └── routes.ts
└── index.ts        # Public API (모든 하위 모듈 export)
```
**포함:** 인증, 장바구니, 주문, 검색, 결제 등

**핵심:**
- UseCase/ViewModel 수준 로직
- Entities 참조만 (import)
- 독립적 배포 가능

### 5. entities/ - 엔티티 (도메인 모델)
```
src/entities/Product/
├── model/
│   ├── product.model.ts   # Entity 클래스
│   ├── product.types.ts   # Product 타입
│   ├── product.factory.ts # Factory 메서드
│   ├── product.repository.ts # Repository 인터페이스
│   └── product.services.ts # 도메인 서비스
├── ui/
│   ├── ProductCard/
│   └── ProductGrid/
├── lib/                   # 도메인 관련 유틸
│   └── price-utils.ts
└── index.ts               # Public API
```
**포함:** DDD 엔티티, 밸류 객체, 애그리거트, 리포지토리 인터페이스

**규칙:**
- 비즈니스 로직만
- 외부 라이브러리 의존 최소화
- Framework agnostic

### 6. shared/ - 공유 모듈
```
src/shared/
├── ui/                   # 순수 UI 컴포넌트
│   ├── Button/
│   ├── Input/
│   ├── Modal/
│   └── index.ts
├── lib/                  # 유틸리티, 헬퍼
│   ├── format.ts
│   ├── validation.ts
│   └── api-client.ts    # Axios/Fetch 래퍼
├── config/               # 설정
│   ├── env.ts
│   ├── routes.ts
│   └── constants.ts
├── hooks/                # 커스텀 훅
│   ├── useMediaQuery.ts
│   └── useLocalStorage.ts
├── types/                # 공통 타입
│   ├── common.ts
│   └── api.ts
└── index.ts              # 전체 export
```

**분류:**
- `shared/ui`: 스타일, 상호작용만 (비즈니스 로직 없음)
- `shared/lib`: 순수 함수 (side-effect 없음)
- `shared/config`: 상수, 설정값
- `shared/types`: 공통 타입 정의

## Public API 설계

### Barrel Export (index.ts)
```typescript
// features/auth/index.ts
export { LoginForm } from './widgets/LoginForm';
export { useAuth } from './model/useAuth';
export type { AuthState, LoginCredentials } from './model/types';

// entities/Product/index.ts
export { Product } from './model/product.model';
export { ProductRepository } from './model/product.repository';
export type { ProductId, ProductProps } from './model/product.types';
```

### Import Path
```typescript
// 올바른 import
import { LoginForm } from '@/features/auth';
import { ProductCard } from '@/entities/Product';
import { Button } from '@/shared/ui';

// 잘못된 import (상세 경로)
import { LoginForm } from '@/features/auth/widgets/LoginForm'; // ❌
```

## Import 규칙

```typescript
// 가능: 상위 → 하위
import { Button } from '@/shared/ui';        // ✅
import { useAuth } from '@/features/auth';  // ✅

// 불가능: 하위 → 상위
import { getProducts } from '@/features/cart/model'; // ❌ (entities import 금지)
import { Product } from '@/shared/lib';               // ❌ (entities import 불가)
```

## 의존성 그래프
```
app → widgets → features → entities → shared
     ↓          ↓          ↓
    상위 레이어만 하위 레이어 참조 가능
```

## Next.js 특화 가이드

### App Router 설정
```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';
import { Header } from '@/widgets/Header';
import { Providers } from '@/shared/lib/Providers';

export default function RootLayout({
  children,
}: ChildrenProps) {
  return (
    <html>
      <body>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### Route Groups
```typescript
// app/(public)/page.tsx        - 공개 페이지
// app/(secure)/dashboard/page.tsx - 인증 필요
// app/(marketing)/landing/page.tsx - 마케팅 랜딩
```

## 코드 예제

### Feature 구조 예시 (인증)
```
features/auth/
├── model/
│   ├── useAuth.ts              # 훅 (상태, 로직)
│   ├── auth.repository.ts      # Repository 인터페이스
│   ├── auth.service.ts         # 도메인 서비스
│   └── types.ts
├── widgets/
│   ├── LoginForm/
│   │   ├── LoginForm.tsx
│   │   ├── LoginForm.module.css
│   │   └── index.ts
│   └── RegisterForm/
├── lib/
│   └── auth-api.ts             # 외부 API 호출
└── index.ts
```

### Entity 구조 예시 (Product)
```
entities/Product/
├── model/
│   ├── product.model.ts        # Product 엔티티
│   ├── product.factory.ts      # 생성 팩토리
│   ├── product.repository.ts   # Repository 인터페이스
│   └── product.types.ts
├── ui/
│   ├── ProductCard/
│   │   ├── ProductCard.tsx
│   │   ├── ProductCard.module.css
│   │   └── index.ts
│   └── ProductGrid/
└── index.ts
```

## 마이그레이션 전략

### 1단계: 분석
```
현재 구조 → FSD layer mapping 작성
```

### 2단계: 점진적 리팩터링
```
1. shared/로 순수 UI/유틸 이동
2. entities/로 도메인 로직 추출
3. features/로 비즈니스 기능 분리
4. widgets/로 UI 블록 추출
```

### 3단계: 검증
```
- 모든 테스트 통과 확인
- Import cycle 없음 확인 (madge 검사)
- 빌드 성공
```

## 주의사항

1. **과도한 분할**: 작은 프로젝트에 FSD 적용 비권장
2. **import 순환**: Entities → Features → Widgets → App 간 순환 주의
3. **Public API**: index.ts 잘 관리, 내부 구현 노출 금지
4. **중복 방지**: shared에만 진정한 재사용 코드
5. **비즈니스 로직**: features/ 또는 entities/에만 위치

## 도구

- **madge**: Import cycle 감지
- **dependency-cruiser**: 의존성 분석
- **barrel-relinker**: barrel file 자동 생성

## 검증 체크리스트

- [ ] 모든 레이어에 해당 컴포넌트 존재
- [ ] Import 순서 준수 (상위→하위)
- [ ] Public API (index.ts) 완성
- [ ] Import cycle 없음
- [ ] 테스트 통과
- [ ] 빌드 성공