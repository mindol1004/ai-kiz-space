# 아키텍처 전문가 (Architecture Expert)

## 역할

소프트웨어 아키텍처 설계와 방법론을 지원하는 전문가 에이전트입니다. TDD(테스트 주도 개발), DDD(도메인 주도 설계), FSD(Feature-Sliced Design) 아키텍처를 포함한 현대적인 개발 방법론을 적용하여 견고하고 유지보수 가능한 시스템을 설계합니다.

## 아키텍처

```
사용자 프롬프트
    ↓
스킬 라우터 (의도 분석 → 스킬 선택)
    ↓
스킬 실행기 (의존성 고려 실행)
    ↓
아키텍처 스킬들
├── tdd-workflow        (TDD 워크플로우)
├── domain-modeling     (DDD 도메인 모델링)
├── fsd-structuring     (FSD 구조 설계)
├── architecture-review (아키텍처 검토)
├── code-quality        (코드 품질)
└── documentation       (문서화)
    ↓
통합 결과 (아키텍처 가이드, 코드 예제, 구조 다이어그램)
```

## 핵심 스킬

### 1. TDD 워크플로우 (tdd-workflow)
- Red-Green-Refactor 사이클 가이드
- 테스트 작성 전략
- Mock/Stub 사용법
- 테스트 피라미드 구성

### 2. DDD 도메인 모델링 (domain-modeling)
- 엔티티, 밸류 객체, 애그리거트
- 유비쿼터스 언어
- 바운디드 컨텍스트
- 리포지토리/서비스 패턴

### 3. FSD 구조 설계 (fsd-structuring)
- Feature-Sliced Design 원칙
- 디렉토리 구조 설계
- 레이어 분리 (pages, widgets, features, entities, shared)
- Public API 설계

### 4. 아키텍처 검토 (architecture-review)
- 설계 원칙 검증 (SOLID, DRY, KISS)
- 기술 스택 평가
- 확장성/유지보수성 검토
- 안티패턴 탐지

### 5. 코드 품질 (code-quality)
- 코드 스멜 탐지
- 리팩토링 제안
- 코드 커버리지 전략
- 정적 분석 도구 설정

### 6. 문서화 (documentation)
- 아키텍처 의사결정 기록 (ADR)
- API 문서 자동화
- README 템플릿
- 다이어그램 생성 (Mermaid)

## 사용 예시

### 예시 1: 새로운 프로젝트 아키텍처 설계

```
사용자: "Next.js로 이커머스 플랫폼을 처음부터 설계하려고 해. TDD와 DDD, FSD를 적용하고 싶어."

에이전트 실행:
1. tdd-workflow: 테스트 전략 수립
2. domain-modeling: 도메인 분석 (주문, 상품, 사용자 등)
3. fsd-structuring: 디렉토리 구조 설계
4. architecture-review: 전체 아키텍처 검토
5. documentation: 아키텍처 문서 초안 작성
```

### 예시 2: 기존 코드 리팩토링

```
사용자: "현재 모놀리식 코드베이스를 FSD로 리팩토링하고 싶어. TDD도 적용해야 해."

에이전트 실행:
1. architecture-review: 현재 아키텍처 진단
2. code-quality: 코드 스멜 분석
3. fsd-structuring: 점진적 분할 계획
4. tdd-workflow: 테스트 커버리지 확보 전략
5. documentation: 마이그레이션 가이드
```

## 의도 분류

| 의도 | 주요 스킬 |
|------|----------|
| 아키텍처 설계 | fsd-structuring, domain-modeling, tdd-workflow |
| TDD 적용 | tdd-workflow, code-quality, documentation |
| DDD 구현 | domain-modeling, architecture-review |
| 코드 리팩토링 | code-quality, architecture-review, tdd-workflow |
| 코드 검토 | architecture-review, code-quality |
| 문서 작성 | documentation, architecture-review |

## 스킬 의존성

```
tdd-workflow: []
domain-modeling: []
fsd-structuring: [domain-modeling]
architecture-review: [domain-modeling, fsd-structuring]
code-quality: [tdd-workflow, architecture-review]
documentation: [architecture-review, fsd-structuring]
```

## 출력 포맷

```typescript
interface ArchitectureResponse {
  methodology: 'TDD' | 'DDD' | 'FSD' | 'Combined';
  recommendations: {
    testStrategy: TestStrategy;
    domainModel: DomainModel;
    fsdStructure: FSDStructure;
    qualityGates: QualityGate[];
  };
  codeExamples: {
    testExample: string;
    domainExample: string;
    structureExample: string;
  };
  diagrams: {
    architecture: string;  // Mermaid 다이어그램
    domain: string;
    flow: string;
  };
  nextSteps: string[];
}
```

## TDD 워크플로우 상세

### Red-Green-Refactor 사이클

```typescript
// 1. Red: 실패하는 테스트 작성
describe('OrderService', () => {
  it('should calculate total price correctly', () => {
    const order = new Order();
    order.addItem(new OrderItem('product-1', 2, 10000));
    
    const total = order.calculateTotal();
    expect(total).toBe(20000); // 실패할 것
  });
});

// 2. Green: 테스트 통과하는 최소한의 코드 작성
class Order {
  private items: OrderItem[] = [];
  
  addItem(item: OrderItem) {
    this.items.push(item);
  }
  
  calculateTotal(): number {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }
}

// 3. Refactor: 코드 개선 (테스트는 통과 상태 유지)
class Order {
  // ...
  calculateTotal(): number {
    //Better naming, maybe extract method
    return this.items.reduce(this.sumItemPrices, 0);
  }
  
  private sumItemPrices(acc: number, item: OrderItem): number {
    return acc + item.getTotalPrice();
  }
}
```

### 테스트 피라미드

```
        통합 테스트 (10%)
          ↑
      E2E 테스트 (5%)
          ↑
    서비스 테스트 (20%)
          ↑
    단위 테스트 (65% - 많을수록 좋음)
```

## DDD 핵심 개념

### 1. 엔티티 (Entity)
```typescript
// ID를 가진 도메인 객체
class Order {
  readonly id: OrderId;
  private items: OrderItem[] = [];
  
  addItem(productId: string, quantity: number, price: number): void {
    // 비즈니스 규칙 검증
    if (quantity <= 0) throw new Error('Invalid quantity');
    
    this.items.push(new OrderItem(productId, quantity, price));
  }
}
```

### 2. 밸류 객체 (Value Object)
```typescript
// ID 없이 속성으로 식별
class Money {
  constructor(
    private readonly amount: number,
    private readonly currency: string
  ) {}
  
  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Currency mismatch');
    }
    return new Money(this.amount + other.amount, this.currency);
  }
}
```

### 3. 애그리거트 (Aggregate)
```typescript
// 변경 가능한 엔티티들의 그룹
class OrderAggregate {
  private order: Order;
  private orderItems: OrderItem[];
  
  // 모든 변경은 애그리거트 루트(Order)를 통해
  addItem(product: Product, quantity: number): void {
    this.order.addItem(product, quantity);
    this.ensureStockAvailability(product, quantity);
    this.domainEventPublisher.publish(new OrderItemAddedEvent(...));
  }
}
```

### 4. 리포지토리 (Repository)
```typescript
interface OrderRepository {
  findById(id: OrderId): Promise<Order | null>;
  save(order: Order): Promise<void>;
  findByCustomer(customerId: CustomerId): Promise<Order[]>;
}

// 구현체 (인프라스트럭처 레이어)
class PrismaOrderRepository implements OrderRepository {
  async findById(id: OrderId): Promise<Order | null> {
    const data = await prisma.order.findUnique({ where: { id } });
    return data ? this.toDomain(data) : null;
  }
}
```

### 5. 도메인 서비스 (Domain Service)
```typescript
// 엔티티에 속하지 않는 도메인 로직
class PricingService {
  calculateDiscount(order: Order, customer: Customer): Money {
    // 복잡한 가격 계산 로직
    const basePrice = order.getSubtotal();
    const discountRate = this.getDiscountRate(customer.tier);
    return new Money(basePrice * discountRate, order.currency);
  }
}
```

## FSD (Feature-Sliced Design) 구조

```
src/
├── app/                    # 루트 레이아웃 및 글로벌 설정
│   ├── (public)/          # PUBLIC 세그먼트 (홈페이지)
│   ├── (secure)/          # SECURE 세그먼트 (인증 필요)
│   └── layout.tsx
├── pages/                  # PAGE: 개별 페이지 (Next.js App Router는 app/에 있음)
├── widgets/                # WIDGET: UI 블록 (헤더, 푸터, 사이드바)
│   ├── Header/
│   ├── Footer/
│   └── Navigation/
├── features/               # FEATURE: 비즈니스 기능 단위
│   ├── auth/
│   │   ├── LoginForm/
│   │   ├── RegisterForm/
│   │   └── model/         # 비즈니스 로직 (useCases)
│   ├── cart/
│   │   ├── CartModal/
│   │   ├── CartSummary/
│   │   └── model/
│   └── orders/
│       ├── OrderList/
│       ├── OrderDetails/
│       └── model/
├── entities/               # ENTITY: 도메인 엔티티 (DDD)
│   ├── Product/
│   ├── Order/
│   ├── User/
│   └── shared/
├── shared/                 # SHARED: 재사용 가능 컴포넌트/유틸리티
│   ├── ui/                 # 순수 UI 컴포넌트 (버튼, 인풋 등)
│   ├── lib/                # 외부 라이브러리 래퍼
│   ├── config/             # 설정 (API 엔드포인트, 상수)
│   ├── helpers/            # 순수 함수 유틸리티
│   └── types/              # 공통 타입 정의
└── public/                 # 정적 자산
```

### 레이어 규칙

```
对外暴露:
  pages → widgets → features → entities → shared

依赖方向:
  LOWER 레이어는 UPPER 레이어에 의존 가능
  UPPER 레이어는 LOWER 레이어에 절대 의존 불가

예:
  - widgets는 entities에 의존 가능
  - entities는 widgets에 의존 불가
```

## 아키텍처 원칙

### 1. Clean Architecture 계층
```
┌─────────────────────────────┐
│       Presentation          │  ( pages, widgets, features UI )
├─────────────────────────────┤
│        Application          │  ( useCases, services )
├─────────────────────────────┤
│         Domain              │  ( entities, value objects, aggregates )
├─────────────────────────────┤
│    Infrastructure           │  ( repositories, external APIs )
└─────────────────────────────┘
```

### 2. SOLID 원칙 적용

- **Single Responsibility**: 각 모듈은 단일 책임
- **Open/Closed**: 확장 가능, 수정 불가능 (전략 패턴)
- **Liskov Substitution**: 하위 타입은 상위 타입으로 대체 가능
- **Interface Segregation**: 인터페이스 분리 ( clients에 맞춤)
- **Dependency Inversion**: 상위 모듈이 하위 모듈에 의존하지 않음

### 3. 의존성 규칙

```typescript
// 나쁜 예: 도메인이 인프라에 의존
class OrderService {
  constructor(private prisma: PrismaClient) {} // ❌ 도메인이 DB 의존
}

// 좋은 예: 의존성 주입
class OrderService {
  constructor(private orderRepository: OrderRepository) {} // ✅ 추상화 의존
}
```

## 코드 품질 체크리스트

### 1. 코드 스멜 감지
- 장황한 메서드 (100行 이상)
- 긴 파라미터 리스트 (5개 이상)
- 중복 코드
- switch문 남용 (다형성 활용)
- 주석으로 설명된 코드 (코드 자체로 의미 전달)

### 2. 테스트 커버리지
- 단위 테스트: 80% 이상
- 통합 테스트: 주요 flows 100%
- E2E 테스트: 핵심 user journey

### 3. 정적 분석
- TypeScript strict 모드
- ESLint + @typescript-eslint
- Prettier 통합
- Husky + lint-staged (pre-commit)

## 실제 적용 예시

### 요청: "이커머스 주문 시스템을 TDD로 개발하고 싶어"

1. **TDD 워크플로우 스킬**이:
   - 테스트 전략 수립 (Unit, Integration, E2E 비율)
   - 테스트 더블 (Mock, Stub, Fake) 사용 가이드
   - Fixture/Factory 패턴 구현

2. **DDD 도메인 모델링 스킬**이:
   - Order, Product, Customer 엔티티 정의
   - Order aggregate (루트) 설계
   - Domain events (OrderPlaced, PaymentCompleted)
   - Repository interface 정의

3. **FSD 구조 설계 스킬**이:
   - features/order/ 구조 생성
   - entities/Order/ 구성
   - shared/ui/ 공통 컴포넌트 추출

4. **코드 품질 스킬**이:
   - ESLint/Prettier config
   - Jest testing setup
   - CI/CD pipeline 제안

5. **문서화 스킬**이:
   - ADR (Architecture Decision Record) 작성
   - API 문서 (OpenAPI/Swagger)
   - README with architecture diagram

## 스킬 구현 가이드

모든 스킬은 동일한 인터페이스를 구현합니다:

```typescript
import type { SkillHandler, SkillInput, SkillOutput } from '@/types/skill';

export class TDDWorkflowSkill implements SkillHandler {
  async execute(input: SkillInput): Promise<SkillOutput> {
    const { projectType, language, framework } = input.parameters;

    // TDD 워크플로우 생성
    const workflow = this.createWorkflow(projectType, framework);
    const testStrategy = this.designTestStrategy(projectType);
    const examples = this.generateCodeExamples(framework);

    return {
      status: 'success',
      result: { workflow, testStrategy, examples },
      summary: 'TDD 워크플로우 설계 완료'
    };
  }

  getDependencies(): string[] {
    return []; // 독립적
  }

  getParameters(): ParameterSchema[] {
    return [
      { name: 'projectType', type: 'string', required: true },
      { name: 'language', type: 'string', required: false, default: 'typescript' },
      { name: 'framework', type: 'string', required: false, default: 'nextjs' }
    ];
  }
}
```

## 스킬 라우터 매핑

```typescript
private getArchitectureSkillMap(): Record<string, string[]> {
  return {
    '아키텍처 설계': ['fsd-structuring', 'domain-modeling', 'architecture-review'],
    'TDD': ['tdd-workflow', 'code-quality', 'documentation'],
    'DDD': ['domain-modeling', 'architecture-review'],
    '리팩토링': ['code-quality', 'architecture-review', 'tdd-workflow'],
    '코드 검토': ['architecture-review', 'code-quality'],
    '문서화': ['documentation', 'architecture-review']
  };
}
```

## 주의사항

1. **TDD는 단순히 테스트를 먼저 쓰는 것이 아님**: 설계를 테스트로 표현하는 것
2. **DDD는 복잡한 도메인에만 적용**: 간단한 CRUD는 over-engineering
3. **FSD는 규모가 큰 프로젝트에 적합**: 작은 프로젝트는 간단한 구조 유지
4. **아키텍처는 상황에 맞게 조정**: 규칙보다 원칙을 이해하고 적용

## 참고 자료

- [TDD by Example - Kent Beck](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530)
- [Domain-Driven Design - Eric Evans](https://www.domainlanguage.com/ddd/)
- [Feature-Sliced Design - https://feature-sliced.design/](https://feature-sliced.design/)
- [Clean Architecture - Robert C. Martin](https://www.oreilly.com/library/view/clean-architecture-a/9780134494272/)