# Shared Layer (FSD 아키텍처)

Next.js 프로젝트의 공유 레이어로, 재사용 가능한 UI 컴포넌트, 유틸리티, 훅, 타입 및 검증을 포함합니다.

## 디렉토리 구조

```
shared/
├── ui/                  # 재사용 가능한 Base UI 컴포넌트 (비즈니스 로직 없음)
│   ├── button/          # 버튼 컴포넌트
│   ├── input/           # 입력 필드 컴포넌트
│   ├── badge/           # 배지 컴포넌트
│   ├── card/            # 카드 컴포넌트
│   ├── modal/           # 모달 컴포넌트
│   ├── toast/           # 토스트 알림 컴포넌트
│   ├── spinner/         # 로딩 스피너 컴포넌트
│   └── avatar/          # 아바타 컴포넌트
│
├── lib/                 # 유틸리티 함수
│   ├── utils.ts         # cn, formatPrice, formatDate 등 공통 유틸
│   └── index.ts         # 베럴 익스포트
│
├── hooks/               # 커스텀 React 훅
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   ├── useMediaQuery.ts
│   ├── useClickOutside.ts
│   ├── useScrollPosition.ts
│   ├── useIsMounted.ts
│   └── index.ts         # 베럴 익스포트
│
├── types/               # TypeScript 타입 정의
│   ├── index.ts         # 전체 타입 (엔티티, API 응답 등)
│   └── auth.ts          # 인증 관련 타입
│
├── validations/         # Zod 검증 스키마
│   ├── index.ts         # 전체 스키마 (login, register 등)
│   └── auth.ts          # 인증 검증 스키마
│
└── config/              # 설정값
    ├── index.ts         # 전체 설정
    └── site.ts          # 사이트 설정
```

## 사용 예시

### UI 컴포넌트 임포트
```typescript
import { Button, Input, Card, Modal } from "@/shared/ui";
```

### 유틸리티 함수 임포트
```typescript
import { cn, formatPrice, formatDate } from "@/shared/lib";
```

### 훅 임포트
```typescript
import { useDebounce, useLocalStorage, useMediaQuery } from "@/shared/hooks";
```

### 타입 임포트
```typescript
import type { User, Product, ApiResponse } from "@/shared/types";
```

### 검증 스키마 임포트
```typescript
import { loginSchema, registerSchema } from "@/shared/validations";
```

## 베럴 익스포트 (Barrel Export)

각 디렉토리의 `index.ts` 파일을 통해 하위 모듈을 재exports하여
단일 경로로 모든 것에 접근할 수 있습니다.

## 컴포넌트 설계 원칙

1. **비즈니스 로직 없음**: UI 컴포넌트는 순수하게 보여주기만 합니다.
2. **Props 인터페이스**: 모든 컴포넌트는 명확한 TypeScript 인터페이스를 가집니다.
3. **접근성**: 시맨틱 HTML과 aria 속성을 포함합니다.
4. **Tailwind CSS**: 일관된 스타일링을 위해 Tailwind를 사용합니다.
5. **Variant 지원**: Button, Badge 등은 cva를 사용한 variant 패턴을 지원합니다.

## 참고 자료

- [Feature-Slice Design 공식 문서](https://feature-sliced.design)
- [Next.js 공식 문서](https://nextjs.org)
- [Tailwind CSS](https://tailwindcss.com)