# 아키텍처 전문가용 스킬 라우터 확장

## 의도 분류 기준

### 아키텍처 설계
- 키워드: "아키텍처", "설계", "구조", "레이어", "패턴", "확장"
- 예시: "이커머스 플랫폼 아키텍처 설계해줘"

### TDD (테스트 주도 개발)
- 키워드: "TDD", "테스트", "단위테스트", "통합테스트", "Red-Green", "리팩토링"
- 예시: "TDD 방식으로 주문 서비스开发하고 싶어"

### DDD (도메인 주도 설계)
- 키워드: "DDD", "도메인", "엔티티", "애그리거트", "유비쿼터스", "바운디드"
- 예시: "주문 도메인을 DDD로 모델링해줘"

### FSD (Feature-Sliced Design)
- 키워드: "FSD", "피처슬라이스", "디렉토리", "구조", "레이어"
- 예시: "Next.js 프로젝트를 FSD로 구조화해줘"

### 코드 품질
- 키워드: "코드품질", "리팩토링", "코드스멜", "클린코드", "SOLID"
- 예시: "현재 코드베이스의 코드 품질을 분석해줘"

### 문서화
- 키워드: "문서", "ADR", "API문서", "README", "다이어그램"
- 예시: "아키텍처 의사결정 기록(ADR) 작성해줘"

### 코드 검토
- 키워드: "검토", "리뷰", "문제", "개선", "안티패턴"
- 예시: "현재 아키텍처에 문제점이 있는지 검토해줘"

## 스킬 선택 매트릭스

### 1차 스킬 결정 (주 스킬)
| 의도 | 우선 선택 스킬 |
|------|---------------|
| 아키텍처 설계 | fsd-structuring, domain-modeling, architecture-review |
| TDD 적용 | tdd-workflow, code-quality, documentation |
| DDD 구현 | domain-modeling, architecture-review, documentation |
| FSD 적용 | fsd-structuring, domain-modeling, documentation |
| 리팩토링 | code-quality, tdd-workflow, architecture-review |
| 코드 검토 | architecture-review, code-quality |
| 문서화 | documentation, architecture-review |

### 2차 스킬 결정 (보조 스킬)
| 주 스킬 | 자동 추가 보조 스킬 |
|--------|------------------|
| tdd-workflow | code-quality |
| domain-modeling | architecture-review |
| fsd-structuring | documentation |
| architecture-review | code-quality |
| code-quality | tdd-workflow |
| documentation | architecture-review |

## 스킬 의존성 상세

```typescript
// 스킬 레지스트리 의존성 설정
registry.setDependencies('tdd-workflow', []);
registry.setDependencies('domain-modeling', []);
registry.setDependencies('fsd-structuring', ['domain-modeling']);
registry.setDependencies('architecture-review', ['domain-modeling', 'fsd-structuring']);
registry.setDependencies('code-quality', ['tdd-workflow', 'architecture-review']);
registry.setDependencies('documentation', ['architecture-review', 'fsd-structuring']);
```

## 실행 순서 결정 규칙

### 기본 순서
1. 분석 스킬 (현황 파악)
2. 설계 스킬 (해결책 설계)
3. 검증 스킬 (품질 검토)
4. 문서화 스킬 (기록)

### 의도별 우선순위
| 의도 | 실행 순서 |
|------|----------|
| 새 프로젝트 설계 | fsd-structuring → domain-modeling → tdd-workflow → architecture-review |
| TDD 도입 | tdd-workflow → code-quality → documentation |
| DDD 적용 | domain-modeling → architecture-review → documentation |
| 리팩토링 | architecture-review → code-quality → tdd-workflow |
| 종합 검토 | architecture-review → code-quality → documentation |

## 프롬프트 분석 예시

### 예시 1: 새 프로젝트 아키텍처
```
입력: "Next.js로 SaaS 플랫폼을 처음부터 설계. TDD, DDD, FSD 적용하고 싶어."

분석:
- 의도: 아키텍처 설계
- 키워드: Next.js, SaaS, TDD, DDD, FSD
- 기술스택: Next.js, TypeScript
- 방법론: TDD + DDD + FSD

선택된 스킬:
1. fsd-structuring (우선순위: 1)
   이유: FSD 디렉토리 구조 설계 필요
2. domain-modeling (우선순위: 2)
   이유: DDD 도메인 모델링 필요
3. tdd-workflow (우선순위: 3)
   이유: TDD 워크플로우 설정 필요
4. architecture-review (우선순위: 4)
   이유: 전체 아키텍처 검토 필요
5. documentation (우선순위: 5)
   이유: 아키텍처 문서 작성 필요
```

### 예시 2: TDD 적용
```
입력: "기존 코드에 TDD를 적용하고 싶어. 어떻게 해야 할까?"

분석:
- 의도: TDD
- 키워드: TDD, 테스트, 기존 코드
- 현재 상태: 기존 코드베이스 존재

선택된 스킬:
1. code-quality (우선순위: 1)
   이유: 현재 코드 품질 및 테스트 커버리지 분석
2. tdd-workflow (우선순위: 2)
   이유: TDD 워크플로우 도입 전략 수립
3. documentation (우선순위: 3)
   이유: TDD 가이드라인 문서화
```

### 예시 3: 아키텍처 검토
```
입력: "현재 Next.js + Prisma 아키텍처에 문제가 있는지 검토해줘"

분석:
- 의도: 코드 검토
- 키워드: 검토, 문제, Next.js, Prisma
- 현재 스택: Next.js, Prisma

선택된 스킬:
1. architecture-review (우선순위: 1)
   이유: 아키텍처 문제점 식별
2. code-quality (우선순위: 2)
   이유: 코드 품질 분석
3. documentation (우선순위: 3)
   이유: 문제점 및 개선사항 문서화
```

## 방법론별 특징

### TDD (Test-Driven Development)
```
Cycle: Red → Green → Refactor
- Red: 실패하는 테스트 작성
- Green: 테스트 통과하는最小 코드 작성
- Refactor: 코드 개선 (테스트 통과 유지)

Test Pyramid:
E2E (5%) ↓
Integration (20%) ↓
Unit (65-80%)
```

### DDD (Domain-Driven Design)
```
Core Concepts:
1. Entity: ID로 식별 (e.g., Order)
2. Value Object: 값으로 식별 (e.g., Money, Address)
3. Aggregate: 일관성 경계 (e.g., Order + OrderItems)
4. Repository: 애그리거트 수집/재구현
5. Domain Service: 엔티티에 속하지 않는 로직
6. Domain Event: 상태 변경 통지
```

### FSD (Feature-Sliced Design)
```
Directory Structure:
src/
├── app/           # Routing segments, layouts
├── pages/         # Pages (App Router에서는 app/에 통합)
├── widgets/       # Composite UI blocks
├── features/      # Business features (useCases)
├── entities/      # DDD entities
├── shared/        # Reusable (ui, lib, config)

Rules:
- Public API: index.ts로 공개 인터페이스 정의
- Layer dependencies: 상위 → 하위만 가능
- No business logic in UI components
```

## 스킬 상세 설명

### tdd-workflow
**역할**: 테스트 주도 개발 도입 가이드
**입력**:
- projectType: 'web', 'mobile', 'api'
- testingFramework: 'jest', 'vitest', 'mocha'
**출력**:
- 테스트 전략 (unit/integration/e2e 비율)
- 테스트 더블 사용법
- 테스트 작성 템플릿

### domain-modeling
**역할**: DDD 도메인 모델 설계
**입력**:
- domain: 'ecommerce', 'saas', 'fintech'
- entities: 엔티티 목록
**출력**:
- 엔티티/밸류/애그리거트 정의
- 리포지토리 인터페이스
- Domain events
- CQRS/ES 고려사항

### fsd-structuring
**역할**: FSD 디렉토리 구조 설계
**입력**:
- framework: 'nextjs', 'react', 'vue'
- layers: 원하는 레이어 구성
**출력**:
- 디렉토리 구조 다이어그램
- 각 레이어별 규칙
- Public API 설계
- Import path 규칙

### architecture-review
**역할**: 아키텍처 검토 및 평가
**입력**:
- currentStructure: 현재 구조 설명
- issues: 알고 있는 문제점
**출력**:
- 아키텍처 평가 리포트
- 개선 권고사항
- 리팩토링 우선순위
- 위험 요소

### code-quality
**역할**: 코드 품질 분석 및 리팩토링 제안
**입력**:
- codebase: 코드베이스 정보
- linter: 사용 중인 린터
**출력**:
- 코드 스멜 목록
- 리팩토링 제안
- 테스트 커버리지 전략
- 품질 게이트 설정

### documentation
**역할**: 아키텍처 문서화
**입력**:
- decisions: 아키텍처 의사결정
- diagrams: 포함할 다이어그램
**출력**:
- ADR 템플릿
- Mermaid 다이어그램
- API 문서 구조
- README 초안

## 컨텍스트 활용

### 이전 세션 컨텍스트
이전에 생성된 아키텍처 다이어그램, 도메인 모델 등을 재사용하여 점진적 개선 지원.

```typescript
// 예: 이미 정의된 엔티티가 있으면 domain-modeling에서 재사용
const existingEntities = context?.previousDomain?.entities;
```

### 기술 스택 컨텍스트
```typescript
// 프롬프트에서 기술 스택 추론
const frameworkMatch = prompt.match(/next\.?js|react|vue|angular/);
const dbMatch = prompt.match(/postgresql|mysql|mongodb|prisma/);
```

## 확장 가이드

### 새로운 아키텍처 방법론 추가

1. 새 스킬 생성: `skills/architecture-expert/my-methodology/`
2. `index.ts` 구현 (SkillHandler)
3. 라우터 매핑 추가:
```typescript
private getArchitectureSkillMap(): Record<string, string[]> {
  const map = { /* ... */ };
  map['새 방법론'] = ['my-skill'];
  return map;
}
```

### 커스텀 의도 분류

```typescript
private analyzeArchitecturePrompt(prompt: string): any {
  const customPatterns = {
    '마이크로서비스': /마이크로서비스|microservice/i,
    '이벤트드리븐': /이벤트|event.?driven|CQRS/i,
    // ...
  };
  // ...
}
```

## 실제 프로젝트 적용 예시

### 요청: "React Native 앱을 FSD로 구조화하고 TDD 적용"

**실행 계획:**

```
1. fsd-structuring
   → 디렉토리 구조 생성
   → 레이어별 규칙 정의
   → Public API 설계

2. domain-modeling
   → 앱의 핵심 엔티티 분석
   → 밸류 객체 정의
   → 애그리거트 설계

3. tdd-workflow
   → 테스트 환경 설정 (Jest + React Native Testing Library)
   → 테스트 피라미드 비율 권고
   → Mocking 전략

4. code-quality
   → ESLint/Prettier 설정
   → Commitlint, Husky 설정
   → CI/CD 품질 게이트

5. documentation
   → ADR 작성
   → 컴포넌트 문서 자동화 (Storybook)
   → 아키텍처 다이어그램
```

**생성된 결과:**

- `src/app/`, `src/features/`, `src/shared/` 구조
- `Order`, `Product`, `Cart` 엔티티 정의
- Jest 설정 + 테스트 예제
- ESLint + Husky 설정 files
- ADR 3개 (아키텍처, 테스트 전략, 품질 기준)
- Mermaid 아키텍처 다이어그램

## 주의사항

1. **과도한 설계**: 간단한 프로젝트에 DDD/FSD 오버엔지니어링 주의
2. **학습 곡선**: FSD는 처음에 이해하기 어려울 수 있음
3. **도구 설정**: TDD는 올바른 테스트 환경 설정 필수
4. **팀 합의**: 아키텍처 결정은 팀 전체 합의 필요
5. **점진적 적용**: 한 번에 모든 것을 바꾸지 말고 점진적으로

## 참고 자료

- [Feature-Sliced Design 공식](https://feature-sliced.design/)
- [TDD by Example - Kent Beck](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530)
- [Domain-Driven Design - Eric Evans](https://www.domainlanguage.com/ddd/)
- [Clean Architecture - Robert C. Martin](https://www.oreilly.com/library/view/clean-architecture-a/9780134494272/)