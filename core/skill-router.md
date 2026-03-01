# 스킬 라우터 구현 가이드

## 개요

스킬 라우터는 사용자의 자연어 프롬프트를 분석하여 적절한 스킬을 선택하고 실행 순서를 결정하는 핵심 컴포넌트입니다.

## 아키텍처

```typescript
class SkillRouter {
  private registry: SkillRegistry;

  constructor(registry: SkillRegistry) {
    this.registry = registry;
  }

  async route(input: RouterInput): Promise<RouterOutput> {
    // 1. 프롬프트 분석
    const analysis = this.analyzePrompt(input.userPrompt, input.agentType);

    // 2. 스킬 선택
    const selectedSkills = this.selectSkills(analysis, input.agentType, input);

    // 3. 실행 순서 결정
    const orderedSkills = this.determineOrder(selectedSkills, analysis);

    // 4. 접근 방식 제안
    const suggestedApproach = this.suggestApproach(analysis, orderedSkills);

    return {
      selectedSkills: orderedSkills,
      intent: analysis.intent,
      suggestedApproach
    };
  }
}
```

## 1. 프롬프트 분석 (analyzePrompt)

### 에이전트 타입별 분석기

```typescript
private analyzePrompt(prompt: string, agentType: string): any {
  if (agentType === 'shopping-planner') {
    return this.analyzeShoppingPrompt(prompt);
  } else if (agentType === 'database-expert') {
    return this.analyzeDatabasePrompt(prompt);
  }

  return { intent: '일반 문의', keywords: [] };
}
```

### 쇼핑몰 기획 전문가 의도 분석

**의도 패턴 매핑:**

```typescript
const intentPatterns = {
  '신규 기획': /기획|설계|구축|만들자|런칭/i,
  '문제 해결': /문제|어떻게|방법|해결|이슈|장애/i,
  '최적화': /최적화|개선|높이는|낮추는|향상/i,
  '분석': /분석|조사|연구|파악/i,
  '전략 수립': /전략|계획|로드맵|방향/i,
  '마케팅': /마케팅|프로모션|광고|홍보|바이럴/i,
  '고객': /고객|구매자|사용자|회원|전환율|리텐션/i,
  '상품': /상품|제품|카테고리|가격|재고|포트폴리오/i
};
```

**엔티티 추출 예시:**

```typescript
private extractShoppingEntities(prompt: string): any[] {
  const entities: any[] = [];

  // 타겟 연령/성별
  const targetMatch = prompt.match(/(\d+)대\s*(여성|남성|전체)/);
  if (targetMatch) {
    entities.push({
      type: 'target',
      value: targetMatch[0],
      age: targetMatch[1],
      gender: targetMatch[2]
    });
  }

  // 카테고리
  const categories = ['뷰티', '패션', '식품', '생활', '전자', '유아', '스포츠'];
  categories.forEach(cat => {
    if (prompt.includes(cat)) {
      entities.push({ type: 'category', value: cat });
    }
  });

  // 예산
  const budgetMatch = prompt.match(/(\d+(?:,\d{3})*)\s*(만원|천원|원)/);
  if (budgetMatch) {
    entities.push({
      type: 'budget',
      value: budgetMatch[0],
      amount: parseInt(budgetMatch[1].replace(/,/g, ''))
    });
  }

  return entities;
}
```

**분석 결과 형식:**

```typescript
{
  intent: '신규 기획',
  confidence: 0.8,
  keywords: ['30대', '여성', '뷰티', '기획'],
  entities: [
    { type: 'target', value: '30대 여성', age: '30', gender: '여성' },
    { type: 'category', value: '뷰티' }
  ],
  agentType: 'shopping-planner'
}
```

## 2. 스킬 선택 (selectSkills)

### 스킬 매핑 테이블

```typescript
private getShoppingSkillMap(): Record<string, string[]> {
  return {
    '신규 기획': [
      'target-analysis',
      'competitor-analysis',
      'business-model',
      'category-design',
      'portfolio-strategy',
      'pricing-strategy'
    ],
    '문제 해결': [
      'customer-analytics',
      'troubleshooting',
      'conversion-optimization'
    ],
    '최적화': [
      'conversion-optimization',
      'performance-monitoring',
      'personalization'
    ],
    '분석': [
      'customer-analytics',
      'market-analysis',
      'sales-analysis'
    ],
    '전략 수립': [
      'business-model',
      'growth-strategy',
      'channel-strategy'
    ],
    '마케팅': [
      'channel-strategy',
      'promotion-planning',
      'brand-identity',
      'viral-marketing'
    ],
    '고객': [
      'customer-analytics',
      'journey-design',
      'conversion-optimization',
      'retention-strategy',
      'personalization'
    ],
    '상품': [
      'category-design',
      'portfolio-strategy',
      'pricing-strategy',
      'seasonal-trend'
    ]
  };
}
```

### 스킬 선택 로직

```typescript
private selectSkills(
  analysis: any,
  agentType: string,
  input: RouterInput
): SkillSelection[] {
  const selections: SkillSelection[] = [];

  if (agentType === 'shopping-planner') {
    const skillMap = this.getShoppingSkillMap();
    const matchingSkills = skillMap[analysis.intent] || [];

    matchingSkills.forEach((skillId: string, index: number) => {
      if (this.registry.has(skillId)) {
        selections.push({
          skillId,
          priority: index + 1,
          reason: this.getShoppingReason(skillId, analysis)
        });
      }
    });
  }

  return selections;
}
```

### 선택 이유 생성

```typescript
private getShoppingReason(skillId: string, analysis: any): string {
  const reasons: Record<string, string> = {
    'target-analysis': '타겟 고객 상세 분석 필요',
    'competitor-analysis': '경쟁사 환경 파악 필요',
    'business-model': '비즈니스 모델 수립 필요',
    'category-design': '카테고리 구조 설계 필요',
    // ...
  };

  return reasons[skillId] || `${skillId} 실행 필요`;
}
```

## 3. 실행 순서 결정 (determineOrder)

### 기본 전략

1. **우선순위 기준 정렬**: 낮은 priority 먼저 실행
2. **의존성 반영**: 의존성이 있는 스킬은 의존성 이후 실행
3. **병렬화 가능성**: 의존성이 없는 스킬들은 병렬 실행 가능

### 의존성 그래프 기반 순서 결정

```typescript
private determineOrder(
  selections: SkillSelection[],
  analysis: any
): SkillSelection[] {
  // 기본 정렬
  const sorted = [...selections].sort((a, b) => a.priority - b.priority);

  // TODO: 의존성을 고려한 topological sort 적용 가능
  // 현재는 간단히 priority만 사용

  return sorted;
}
```

**실행 계획 단계:**

```
Input: [target-analysis (p1), competitor-analysis (p2), business-model (p3)]
Dependencies: {
  'competitor-analysis': ['target-analysis'],
  'business-model': ['target-analysis', 'competitor-analysis']
}

Execution Plan:
Phase 1: [target-analysis]                    // sequential
Phase 2: [competitor-analysis]                // sequential (target-analysis 필요)
Phase 3: [business-model]                     // sequential (target, competitor 필요)
```

## 4. 접근 방식 제안 (suggestApproach)

사용자에게 실행 계획을 설명하는 추천 메시지를 생성합니다.

```typescript
private suggestShoppingApproach(analysis: any, skills: SkillSelection[]): string {
  const skillCount = skills.length;

  if (analysis.intent.includes('기획')) {
    return `신규 쇼핑몰 기획을 위한 ${skillCount}개 단계 프로세스를 제안합니다. 타겟 분석부터 시작하여 경쟁 분석, 비즈니스 모델 수립, 카테고리 설계, 가격 전략까지 체계적으로 진행하세요.`;
  }

  if (analysis.intent.includes('최적화')) {
    return `현황 분석을 먼저 수행한 후, 문제점을 파악하고 최적화 전략을 수립하세요. ${skillCount}개의 스킬을 활용하여 단계적으로 개선하세요.`;
  }

  return `선택된 ${skillCount}개의 스킬을 우선순위대로 실행하여 쇼핑몰 기획 과제를 해결하세요.`;
}
```

## 5. 데이터베이스 전문가용 라우팅

### 의도 분석

```typescript
private analyzeDatabasePrompt(prompt: string): any {
  const intentPatterns = {
    '데이터베이스 설계': /설계|구조|스키마|테이블|정의|ERD/i,
    '쿼리 최적화': /쿼리|성능|느림|빠르게|최적화|EXPLAIN/i,
    '데이터 모델링': /모델링|ERD|관계|엔티티|속성|키/i,
    '성능 모니터링': /모니터링|진단|분석|메트릭/i,
    '인덱싱': /인덱스|색인|검색|빠른조회/i,
    '정규화': /정규화|중복|1NF|2NF|3NF/i,
    '마이그레이션': /마이그레이션|이전|변경|업그레이드/i,
    '문제 해결': /에러|문제|오류|이슈|해결|디버깅/i,
    '용량 계획': /용량|예측|스케일|확장/i,
    '보안': /보안|권한|암호화|인증/i,
    '백업 복구': /백업|복구|재해|안정성/i,
    '복제 샤딩': /복제|리플리카|샤딩|분산/i
  };

  // DB 타입 추출
  const dbTypes = ['postgresql', 'mysql', 'mongodb', 'oracle', 'sqlserver'];
  let detectedDbType: string | undefined;

  for (const dbType of dbTypes) {
    if (prompt.includes(dbType)) {
      detectedDbType = dbType;
      break;
    }
  }

  return {
    intent,
    confidence: 0.8,
    dbType: detectedDbType,
    keywords: this.extractKeywords(prompt),
    entities: this.extractDatabaseEntities(prompt)
  };
}
```

### DB 스킬 매핑

```typescript
private getDatabaseSkillMap(): Record<string, string[]> {
  return {
    '데이터베이스 설계': ['data-modeling', 'database-design', 'normalization', 'indexing-strategy'],
    '쿼리 최적화': ['query-optimization', 'indexing-strategy', 'performance-monitoring'],
    '데이터 모델링': ['data-modeling', 'normalization', 'database-design'],
    '성능 모니터링': ['performance-monitoring', 'query-optimization', 'troubleshooting'],
    '인덱싱': ['indexing-strategy', 'query-optimization', 'performance-monitoring'],
    // ...
  };
}
```

## 6. 확장성

### 새로운 에이전트 추가

1. 새 파일: `agents/my-agent.md` (에이전트 정의)
2. 새 스킬들: `skills/my-agent/` 폴더에 구현
3. 라우터 확장:
```typescript
// skill-router.ts 수정
private analyzePrompt(prompt: string, agentType: string): any {
  if (agentType === 'my-agent') {
    return this.analyzeMyAgentPrompt(prompt);
  }
  // ...
}

private getMyAgentSkillMap(): Record<string, string[]> {
  return {
    '의도1': ['skill-a', 'skill-b'],
    '의도2': ['skill-c', 'skill-d']
  };
}
```

### 사용자 정의 패턴

더 정교한 의도 분석이 필요하면 NLP 라이브러리 도입:

```typescript
import * as natural from 'natural';

// Tokenization + Classification
const tokenizer = new natural.WordTokenizer();
const classifier = new natural.BayesClassifier();

// Training 데이터로 classifier 학습
```

## 7. 테스트

### 단위 테스트

```typescript
describe('SkillRouter', () => {
  let router: SkillRouter;
  let mockRegistry: SkillRegistry;

  beforeEach(() => {
    mockRegistry = new SkillRegistry();
    router = new SkillRouter(mockRegistry);

    // Mock 스킬 등록
    mockRegistry.register('skill-a', new MockSkillA());
    mockRegistry.register('skill-b', new MockSkillB());
  });

  test('쇼핑몰 기획 요청 분석', async () => {
    const result = await router.route({
      userPrompt: '30대 여성 뷰티 쇼핑몰 기획해줘',
      agentType: 'shopping-planner'
    });

    expect(result.intent).toBe('신규 기획');
    expect(result.selectedSkills.length).toBeGreaterThan(0);
    expect(result.selectedSkills[0].skillId).toBe('target-analysis');
  });
});
```

### 통합 테스트

```typescript
test('전체 파이프라인', async () => {
  const agent = new ShoppingPlannerAgent();
  const response = await agent.process('이커머스 플랫폼 기획');

  expect(response.summary).toContain('성공');
  expect(response.result).toBeDefined();
});
```

## 8. 디버깅

### 상세 로깅

```typescript
private analyzePrompt(prompt: string, agentType: string): any {
  console.log(`[SkillRouter] 분석 시작: ${prompt.substring(0, 50)}...`);

  const analysis = /* ... */;

  console.log(`[SkillRouter] 분석 결과:`, {
    intent: analysis.intent,
    confidence: analysis.confidence,
    keywords: analysis.keywords
  });

  return analysis;
}
```

### 프롬프트 디버깅

```typescript
// 의도별 매칭 확인
private analyzeShoppingPrompt(prompt: string): any {
  for (const [intent, pattern] of Object.entries(intentPatterns)) {
    const match = pattern.test(prompt);
    if (match) {
      console.log(`[Matched] ${intent}: ${pattern}`);
    }
  }
  // ...
}
```

## 9. 성능 고려사항

1. **캐싱**: 동일 프롬프트에 대한 분석 결과 캐싱
2. **비동기 처리**: 모든 분석은 async/await로 처리
3. **메모리 관리**: 컨텍스트 객체 과도한 성장 방지
4. **타임아웃**: `maxExecutionTime` 설정으로 무한 대기 방지

## 10. 주의사항

1. **의도 분류 정확도**: 정규식만으로는 한계가 있음. 필요시 ML 모델 도입
2. **다중 의도**: "기획 + 마케팅" 같은 복합 요청은 현재 첫 번째 매칭만 처리
3. **한국어 특수성**: 완전한 형태소 분석 필요시 외부 라이브러리 고려
4. **스킬 등록 상태**: 존재하지 않는 스킬 ID는 자동 필터링

## 11. API 참조

### SkillRouter 클래스

```typescript
constructor(registry: SkillRegistry)
route(input: RouterInput): Promise<RouterOutput>
analyzePrompt(prompt: string, agentType: string): any
selectSkills(analysis: any, agentType: string, input: RouterInput): SkillSelection[]
determineOrder(selections: SkillSelection[], analysis: any): SkillSelection[]
suggestApproach(analysis: any, skills: SkillSelection[]): string
```

### 인터페이스

```typescript
interface RouterInput {
  userPrompt: string;
  context?: any;
  agentType?: 'shopping-planner' | 'database-expert' | 'architecture-expert';
}

interface RouterOutput {
  selectedSkills: SkillSelection[];
  intent: string;
  suggestedApproach: string;
}

interface SkillSelection {
  skillId: string;
  priority: number;
  reason: string;
  parameters?: any;
}

---

## 에이전트 확장 가이드

### 새로운 에이전트 추가 방법

1. **에이전트 정의 문서 생성**
   ```bash
   agents/my-agent.md
   ```

2. **스킬 디렉토리 생성**
   ```bash
   mkdir -p skills/my-agent/{skill-a,skill-b}
   ```

3. **스킬 라우터 확장 문서 생성**
   ```bash
   core/my-agent-skill-router.md
   ```
   - 의도 분류 기준
   - 스킬 매핑 테이블
   - 실행 순서 규칙

4. **SkillRouter 클래스 확장**
   ```typescript
   // core/skill-router.ts 수정
   private analyzePrompt(prompt: string, agentType: string): any {
     if (agentType === 'my-agent') {
       return this.analyzeMyAgentPrompt(prompt);
     }
     // ...
   }

   private getMyAgentSkillMap(): Record<string, string[]> {
     return {
       '의도1': ['skill-a', 'skill-b'],
       '의도2': ['skill-c']
     };
   }
   ```

5. **스킬 등록**
   ```typescript
   // ShoppingPlannerAgent.initialize() 참고
   registry.register('skill-a', new SkillA());
   registry.setDependencies('skill-b', ['skill-a']);
   ```

### 기존 확장 참고

- **shopping-planner**: `core/main-agent.md`, `skills/shopping-planner/`
- **database-expert**: `agents/database-expert.md`, `skills/database-expert/`, `core/db-skill-router.md`
- **architecture-expert**: `agents/architecture-expert.md`, `skills/architecture-expert/`, `core/architecture-skill-router.md`

### 에이전트 호출 예시

```typescript
// 쇼핑몰 기획 전문가
const shoppingAgent = new ShoppingPlannerAgent();
await shoppingAgent.process("뷰티 쇼핑몰 기획해줘");

// 데이터베이스 전문가
const dbAgent = new DatabaseExpertAgent({ dbType: 'postgresql' });
await dbAgent.process("이커머스 DB 설계해줘");

// 아키텍처 전문가 (구현 예정)
// const archAgent = new ArchitectureExpertAgent();
// await archAgent.process("Next.js 프로젝트를 FSD로 구조화해줘");
```

## 참고 자료

- [Clean Architecture - Robert C. Martin](https://www.oreilly.com/library/view/clean-architecture-a/9780134494272/)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Domain-Driven Design - Eric Evans](https://www.domainlanguage.com/ddd/)
- [TDD by Example - Kent Beck](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530)
```