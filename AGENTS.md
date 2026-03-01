# AGENTS.md - 에이전트 시스템 가이드

이 문서는 코딩 에이전트가 이 저장소에서 작업할 때 참조하는 핵심 가이드입니다.

## Communication Rules

- 항상 한국어로 응답
- 간결하고 직접적인 응답
- 불필요한 서론/설명 생략

---

## 프로젝트 개요

- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss"` 방식)
- **Runtime**: React 19.2.3
- **Linting**: ESLint 9 + eslint-config-next (core-web-vitals + typescript)
- **Testing**: 미구성
- **Package Manager**: npm

---

## 멀티 에이전트 스킬 시스템

이 프로젝트는 **4개의 전문가 에이전트**와 **스킬 기반 라우팅 시스템**을 갖추고 있습니다.

### 에이전트 아키텍처

```
사용자 프롬프트
    ↓
에이전트 선택 (프롬프트 의도 분석)
    ↓
┌─────────────────────────────────────────────────┐
│  shopping-planner  │  architecture-expert       │
│  database-expert   │  designer-expert           │
└─────────────────────────────────────────────────┘
    ↓
스킬 라우터 (core/skill-router.md)
    ↓
스킬 실행기 (core/skill-executor.md)
    ↓
개별 스킬 문서 (skills/<agent-name>/*.md)
    ↓
통합 결과 반환
```

### 에이전트 선택 기준

사용자 프롬프트에 따라 적절한 에이전트를 선택합니다:

| 에이전트 | 활성화 키워드 | 정의 파일 | 스킬 라우터 |
|----------|-------------|-----------|------------|
| **쇼핑몰 기획** | 쇼핑몰, 이커머스, 기획, 상품, 마케팅, 전환율, 고객분석, 카테고리, 가격전략, 프로모션, 리텐션, 배송, 정산 | `agents/shopping-planner.md` | `core/skill-router.md` |
| **아키텍처** | 아키텍처, 설계, TDD, DDD, FSD, 리팩토링, 코드품질, SOLID, 클린코드, 도메인, 테스트 | `agents/architecture-expert.md` | `core/architecture-skill-router.md` |
| **데이터베이스** | DB, 데이터베이스, 스키마, 쿼리, 인덱스, 정규화, 마이그레이션, ERD, PostgreSQL, MySQL, MongoDB | `agents/database-expert.md` | `core/db-skill-router.md` |
| **디자이너** | 디자인, UX, UI, 와이어프레임, 프로토타입, 접근성, 컬러, 타이포, 디자인시스템, 컴포넌트 라이브러리 | `agents/designer-expert.md` | `core/designer-skill-router.md` |

### 프롬프트 처리 워크플로우

1. **에이전트 정의 파일 읽기**: `agents/<agent-name>.md` 에서 역할, 전문 분야, 작업 방식 확인
2. **스킬 라우터 참조**: 해당 에이전트의 `core/<agent>-skill-router.md` 에서 의도 분류 및 스킬 매핑 확인
3. **스킬 문서 읽기**: `skills/<agent-name>/` 하위의 관련 스킬 `.md` 파일을 읽어 상세 지식 획득
4. **통합 응답 생성**: 스킬 문서의 내용을 조합하여 체계적인 응답 작성

### 예시: "30대 여성 타겟 뷰티 쇼핑몰 기획해줘"

```
1. 에이전트 선택: shopping-planner (키워드: 쇼핑몰, 기획)
2. agents/shopping-planner.md 읽기 → 역할/전문분야 파악
3. core/skill-router.md 참조 → 의도: '신규 기획'
4. 스킬 매핑:
   - target-analysis → skills/shopping-planner/target-analysis.md 읽기
   - competitive-analysis → skills/shopping-planner/competitive-analysis.md 읽기
   - business-model-design → skills/shopping-planner/business-model-design.md 읽기
   - category-design → skills/shopping-planner/category-design.md 읽기
   - pricing-strategy → skills/shopping-planner/pricing-strategy.md 읽기
5. 스킬 문서의 프레임워크/템플릿을 활용하여 응답 생성
```

---

## 디렉토리 구조

```
/workspace/
├── AGENTS.md                    # 이 파일 (에이전트 시스템 가이드)
│
├── agents/                      # 에이전트 정의 (역할, 전문분야, 작업방식)
│   ├── shopping-planner.md      # 쇼핑몰 기획 전문가
│   ├── architecture-expert.md   # 아키텍처 전문가 (TDD/DDD/FSD)
│   ├── database-expert.md       # 데이터베이스 전문가
│   └── designer-expert.md       # 디자이너 전문가 (UX/UI)
│
├── core/                        # 핵심 시스템 문서 (라우팅, 실행 로직)
│   ├── main-agent.md            # 메인 에이전트 구현 가이드
│   ├── skill-router.md          # 스킬 라우터 (의도분석 → 스킬선택)
│   ├── skill-registry.md        # 스킬 레지스트리 (등록/조회/의존성)
│   ├── skill-executor.md        # 스킬 실행기 (의존성 그래프 기반 실행)
│   ├── architecture-skill-router.md  # 아키텍처 에이전트용 라우터
│   ├── db-skill-router.md            # DB 에이전트용 라우터
│   └── designer-skill-router.md      # 디자이너 에이전트용 라우터
│
├── skills/                      # 스킬 정의 문서 (도메인 지식)
│   ├── shopping-planner/        # 쇼핑몰 기획 스킬 (24개)
│   │   ├── README.md
│   │   ├── target-analysis.md
│   │   ├── competitive-analysis.md
│   │   ├── business-model-design.md
│   │   ├── category-design.md
│   │   ├── pricing-strategy.md
│   │   ├── customer-analysis.md
│   │   ├── customer-journey-design.md
│   │   ├── conversion-rate-optimization.md
│   │   ├── retention-strategy.md
│   │   ├── marketing-channel-strategy.md
│   │   ├── promotion-planning.md
│   │   ├── brand-identity.md
│   │   ├── viral-marketing.md
│   │   ├── product-portfolio-management.md
│   │   ├── seasonal-trend-planning.md
│   │   ├── growth-strategy.md
│   │   ├── kpi-design.md
│   │   ├── sales-analysis.md
│   │   ├── personalization-system.md
│   │   ├── performance-monitoring.md
│   │   ├── order-shipping-management.md
│   │   ├── settlement-management.md
│   │   ├── supply-chain-optimization.md
│   │   └── quality-management.md
│   ├── architecture-expert/     # 아키텍처 스킬 (6개)
│   │   ├── tdd-workflow/README.md
│   │   ├── domain-modeling/README.md
│   │   ├── fsd-structuring/README.md
│   │   ├── architecture-review/README.md
│   │   ├── code-quality/README.md
│   │   └── documentation/README.md
│   └── database-expert/         # DB 스킬 (12개)
│       └── README.md
│
├── types/                       # TypeScript 타입 정의
│   └── skill.ts                 # SkillHandler, SkillInput, SkillOutput 인터페이스
│
├── app/                         # Next.js App Router (페이지/API)
│   ├── layout.tsx               # 루트 레이아웃
│   ├── page.tsx                 # 홈 페이지
│   ├── globals.css              # 글로벌 스타일 (Tailwind v4)
│   ├── style-guide/
│   │   └── page.tsx             # 스타일 가이드 페이지
│   └── api/
│       └── planner/
│           └── route.ts         # 쇼핑몰 기획 API 엔드포인트
│
├── src/                         # 소스 모듈
│   ├── components/
│   │   ├── ThemeToggle.tsx      # 다크모드 토글 (client component)
│   │   └── ThemeProviderWrapper.tsx  # ThemeProvider 래퍼 (client component)
│   └── lib/
│       ├── utils.ts             # 유틸리티 (cn 함수 등)
│       └── theme/
│           ├── types.ts         # ThemeConfig, ThemeService 타입
│           ├── theme-service.ts # 테마 서비스 구현
│           └── README.md        # 디자인 시스템 문서
│
├── public/                      # 정적 자산 (SVG 아이콘)
├── next.config.ts               # Next.js 설정
├── tsconfig.json                # TypeScript 설정
├── eslint.config.mjs            # ESLint 설정
├── postcss.config.mjs           # PostCSS 설정 (@tailwindcss/postcss)
└── package.json
```

---

## 에이전트별 스킬 상세

### 1. 쇼핑몰 기획 전문가 (shopping-planner)

**정의**: `agents/shopping-planner.md`
**라우터**: `core/skill-router.md`
**스킬 디렉토리**: `skills/shopping-planner/`

#### 의도 → 스킬 매핑

| 의도 | 활성화 키워드 | 실행할 스킬 (순서대로) |
|------|-------------|----------------------|
| 신규 기획 | 기획, 설계, 구축, 런칭 | target-analysis → competitive-analysis → business-model-design → category-design → pricing-strategy |
| 마케팅 | 마케팅, 프로모션, 광고, 바이럴 | marketing-channel-strategy → brand-identity → promotion-planning → viral-marketing |
| 고객 경험 | 고객, 전환율, 리텐션, 여정 | customer-analysis → customer-journey-design → conversion-rate-optimization → retention-strategy |
| 상품 관리 | 상품, 카테고리, 가격, 재고 | category-design → product-portfolio-management → pricing-strategy → seasonal-trend-planning |
| 운영 관리 | 주문, 배송, 정산, 품질 | order-shipping-management → settlement-management → supply-chain-optimization → quality-management |
| 데이터 분석 | 분석, KPI, 성과, 매출 | kpi-design → sales-analysis → performance-monitoring → personalization-system |
| 성장 전략 | 전략, 계획, 성장, 로드맵 | growth-strategy → customer-analysis → retention-strategy |

#### 스킬 의존성 그래프

```
target-analysis (독립)
    ↓
competitive-analysis (target-analysis 필요)
    ↓
business-model-design (target-analysis, competitive-analysis 필요)
    ↓
category-design (business-model-design 필요)
    ↓
pricing-strategy (competitive-analysis 필요)
```

### 2. 아키텍처 전문가 (architecture-expert)

**정의**: `agents/architecture-expert.md`
**라우터**: `core/architecture-skill-router.md`
**스킬 디렉토리**: `skills/architecture-expert/`

#### 의도 → 스킬 매핑

| 의도 | 활성화 키워드 | 실행할 스킬 |
|------|-------------|-----------|
| 아키텍처 설계 | 아키텍처, 설계, 구조 | fsd-structuring, domain-modeling, architecture-review |
| TDD 적용 | TDD, 테스트, Red-Green | tdd-workflow, code-quality, documentation |
| DDD 구현 | DDD, 도메인, 엔티티, 애그리거트 | domain-modeling, architecture-review, documentation |
| FSD 적용 | FSD, 피처슬라이스, 레이어 | fsd-structuring, domain-modeling, documentation |
| 리팩토링 | 리팩토링, 코드스멜, 클린코드 | code-quality, architecture-review, tdd-workflow |
| 코드 검토 | 검토, 리뷰, 안티패턴 | architecture-review, code-quality |
| 문서화 | 문서, ADR, 다이어그램 | documentation, architecture-review |

#### 스킬 의존성

```
tdd-workflow: []
domain-modeling: []
fsd-structuring: [domain-modeling]
architecture-review: [domain-modeling, fsd-structuring]
code-quality: [tdd-workflow, architecture-review]
documentation: [architecture-review, fsd-structuring]
```

### 3. 데이터베이스 전문가 (database-expert)

**정의**: `agents/database-expert.md`
**라우터**: `core/db-skill-router.md`
**스킬 디렉토리**: `skills/database-expert/`

#### 의도 → 스킬 매핑

| 의도 | 활성화 키워드 | 실행할 스킬 |
|------|-------------|-----------|
| DB 설계 | 설계, 스키마, 테이블, ERD | data-modeling → database-design → normalization → indexing-strategy |
| 쿼리 최적화 | 쿼리, 느림, 성능, EXPLAIN | performance-monitoring → query-optimization → indexing-strategy |
| 마이그레이션 | 마이그레이션, 이전, 변환 | schema-migration → database-design → backup-recovery |
| 성능 문제 | 모니터링, 진단, 메트릭 | performance-monitoring → query-optimization |
| 보안 | 보안, 권한, 암호화 | security-optimization → database-design |
| 확장 | 복제, 샤딩, 분산, 스케일 | capacity-planning → replication-sharding |

### 4. 디자이너 전문가 (designer-expert)

**정의**: `agents/designer-expert.md`
**라우터**: `core/designer-skill-router.md`

#### 의도 → 스킬 매핑

| 의도 | 활성화 키워드 | 실행할 스킬 |
|------|-------------|-----------|
| 새 프로젝트 | UX, 디자인, 새로 만들기 | ux-research → information-architecture → wireframing → visual-design |
| 디자인 시스템 | 디자인시스템, 컴포넌트, 토큰 | visual-design → design-system → accessibility → prototyping |
| redesign | 개선, 간소화, 리디자인 | design-review → ux-research → wireframing → visual-design |
| 접근성 | 접근성, WCAG, A11y | accessibility → design-review → visual-design |
| 프로토타입 | 프로토타입, 인터랙션 | wireframing → visual-design → prototyping |

#### 스킬 의존성

```
ux-research: []
information-architecture: [ux-research]
wireframing: [information-architecture]
visual-design: [wireframing]
design-system: [visual-design, wireframing]
accessibility: [visual-design]
prototyping: [wireframing, visual-design]
design-review: [모든 스킬 완료 후]
```

---

## 스킬 시스템 핵심 개념

### 타입 정의 (`types/skill.ts`)

```typescript
interface SkillHandler {
  execute(input: SkillInput): Promise<SkillOutput>;
  getDependencies(): string[];
  getParameters(): ParameterSchema[];
}

interface SkillInput {
  parameters: Record<string, unknown>;
  context?: Record<string, unknown>;   // 이전 스킬 결과
}

interface SkillOutput {
  status: 'success' | 'error' | 'skipped';
  result: unknown;
  summary: string;
}
```

### 스킬 실행 순서 (core/skill-executor.md 참조)

1. **의존성 그래프 구축**: 선택된 스킬들의 의존성 분석
2. **위상 정렬**: 의존성이 해결된 스킬들을 Phase로 그룹화
3. **순차/병렬 실행**: 독립 스킬은 병렬, 의존 스킬은 순차 실행
4. **컨텍스트 전파**: 이전 스킬 결과가 다음 스킬의 context로 전달
5. **결과 통합**: 모든 스킬 결과를 통합하여 최종 응답 생성

### 새 스킬 추가 방법

1. `skills/<agent-name>/` 아래에 스킬 `.md` 파일 생성
2. 에이전트 정의 문서(`agents/<agent>.md`)에 스킬 추가
3. 스킬 라우터(`core/<agent>-skill-router.md`)에 의도 매핑 추가
4. 필요시 의존성 설정

### 새 에이전트 추가 방법

1. `agents/<new-agent>.md` 에이전트 정의 문서 생성
2. `skills/<new-agent>/` 디렉토리에 스킬 문서 생성
3. `core/<new-agent>-skill-router.md` 라우터 문서 생성
4. 이 AGENTS.md의 에이전트 선택 기준 테이블에 추가

---

## 커맨드

### 개발

```bash
npm run dev       # 개발 서버 (http://localhost:3000)
npm run build     # 프로덕션 빌드
npm run start     # 프로덕션 서버 실행
```

### 린트

```bash
npm run lint              # 전체 프로젝트 ESLint
npx eslint <file-path>    # 특정 파일 ESLint
```

---

## 코드 스타일 가이드라인

### 일반 규칙

- **TypeScript** 필수 (`.ts`/`.tsx`), strict mode
- **ES modules** (import/export)
- **2 spaces** 들여쓰기

### Import 순서

```typescript
// 1. Next.js/React
import type { Metadata } from "next";
import Image from "next/image";

// 2. 외부 라이브러리
import { useState } from "react";

// 3. 내부 모듈 (@/ alias)
import { MyComponent } from "@/src/components/MyComponent";
import { cn } from "@/src/lib/utils";

// 4. 상대 경로
import "./styles.css";
```

### 네이밍 컨벤션

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 파일 | PascalCase | `ThemeToggle.tsx` |
| 유틸리티 파일 | camelCase | `utils.ts` |
| 설정 파일 | kebab-case | `next.config.ts` |
| 변수/함수 | camelCase | `getUserData()` |
| 타입/인터페이스 | PascalCase | `ThemeConfig` |
| 상수 (컴파일 타임) | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |

### Path Alias

`@/*`는 프로젝트 루트(`./`)에 매핑됩니다:

```typescript
// @/src/components/... → ./src/components/...
// @/app/...           → ./app/...
// @/types/...         → ./types/...
```

### TypeScript

- 함수 반환 타입 항상 선언
- `type`: 유니온, 인터섹션, 프리미티브에 사용
- `interface`: 확장 가능한 객체 형태에 사용
- `any` 금지, 불확실할 때 `unknown` 사용

### React/Next.js 패턴

- **Server Components** 기본 (no "use client")
- "use client"는 브라우저 API/hooks 사용 시에만
- `next/image`로 이미지, `next/font/google`으로 폰트
- Server Components props에 `Readonly<{...}>` 사용

### Tailwind CSS v4

- `globals.css`에서 `@import "tailwindcss"` 사용 (v3의 `@tailwind` 아님)
- `@theme inline`으로 커스텀 디자인 토큰 정의
- `dark:` prefix로 다크모드 지원

### Error Handling

- Server Components: 에러 전파
- Client Components: Error Boundary로 처리
- `any` 대신 `unknown` 사용

---

## ESLint 설정

`eslint.config.mjs`에서 다음을 사용:
- `eslint-config-next/core-web-vitals`: Core Web Vitals 규칙
- `eslint-config-next/typescript`: TypeScript 규칙

**무시 디렉토리**: `.next/`, `out/`, `build/`, `next-env.d.ts`

린트 통과 확인 후 커밋하세요.

---

## API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/planner` | 쇼핑몰 기획 에이전트 요청 |
| GET | `/api/planner` | 에이전트 상태 확인 |

---

## Best Practices

1. **Performance**: `next/image` + `priority` (above-the-fold), Tailwind v4 자동 최적화
2. **Accessibility**: 시맨틱 HTML, alt 텍스트, 키보드 내비게이션
3. **Security**: 사용자 입력 검증, 위험한 URL 방지
4. **SEO**: pages/layouts에서 `metadata` export
5. **Agent Skills**: 스킬 문서를 읽고 프레임워크/템플릿을 활용하여 체계적 응답 생성
