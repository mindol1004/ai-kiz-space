# 쇼핑몰 기획 전문가 - 구현 가이드

## 개요

이 문서는 쇼핑몰 기획 전문가 에이전트 시스템을 구현하기 위한 상세 가이드입니다. 기존 문서(`main-agent.md`)는 개념 설명을 제공하며, 이 문서는 실제 코드 구현에 필요한 기술적 세부사항을 다룹니다.

## 파일 구조

```
/workspace/
├── core/
│   ├── skill-registry.ts    # 스킬 등록 및 관리
│   ├── skill-router.ts      # 프롬프트 분석 및 스킬 선택
│   ├── skill-executor.ts    # 스킬 실행 및 의존성 관리
│   └── main-agent.ts        # 메인 에이전트 클래스
├── skills/
│   └── shopping-planner/
│       ├── target-analysis/
│       │   └── index.ts
│       ├── competitor-analysis/
│       │   └── index.ts
│       ├── business-model/
│       │   └── index.ts
│       ├── category-design/
│       │   └── index.ts
│       ├── customer-analytics/
│       │   └── index.ts
│       ├── journey-design/
│       │   └── index.ts
│       ├── conversion-optimization/
│       │   └── index.ts
│       └── pricing-strategy/
│           └── index.ts
├── types/
│   └── skill.ts             # 공통 타입 정의
└── app/
    └── api/
        └── planner/
            └── route.ts     # Next.js API 엔드포인트
```

## 1. 스킬 레지스트리 (skill-registry.ts)

### 역할
모든 스킬을 중앙에서 등록, 조회, 관리하는 싱글턴 레지스트리

### 구현要点

```typescript
import { SkillHandler } from '@/types/skill';

export class SkillRegistry {
  private skills: Map<string, SkillHandler> = new Map();
  private dependencies: Map<string, string[]> = new Map();

  // 1. 스킬 등록
  register(skillId: string, handler: SkillHandler): void {
    this.skills.set(skillId, handler);
  }

  // 2. 스킬 조회
  get(skillId: string): SkillHandler | undefined {
    return this.skills.get(skillId);
  }

  // 3. 의존성 설정
  setDependencies(skillId: string, deps: string[]): void {
    this.dependencies.set(skillId, deps);
  }

  getDependencies(skillId: string): string[] {
    return this.dependencies.get(skillId) || [];
  }

  // 4. 의존성 그래프 구축
  buildDependencyGraph(skillIds: string[]): Map<string, string[]> {
    const graph = new Map<string, string[]>();

    for (const skillId of skillIds) {
      const deps = this.getDependencies(skillId);
      const filteredDeps = deps.filter(dep => skillIds.includes(dep));
      graph.set(skillId, filteredDeps);
    }

    return graph;
  }

  listSkills(): string[] {
    return Array.from(this.skills.keys());
  }

  get size(): number {
    return this.skills.size;
  }
}
```

### 초기화 방법

```typescript
// ShoppingPlannerAgent.initialize()에서 호출
static initialize(): SkillRegistry {
  const registry = new SkillRegistry();

  // 스킬 클래스들 import
  const { TargetAnalysisSkill } = require('./skills/shopping-planner/target-analysis');
  // ... 다른 스킬들

  // 등록
  registry.register('target-analysis', new TargetAnalysisSkill());
  registry.register('competitor-analysis', new CompetitorAnalysisSkill());
  // ...

  // 의존성 설정
  registry.setDependencies('target-analysis', []);
  registry.setDependencies('competitor-analysis', ['target-analysis']);
  registry.setDependencies('business-model', ['target-analysis', 'competitor-analysis']);
  // ...

  return registry;
}
```

## 2. 스킬 라우터 (skill-router.ts)

### 역할
사용자 프롬프트를 분석하여 관련 스킬을 자동 선택하고 실행 순서 결정

### 핵심 메서드

#### `route(input: RouterInput): Promise<RouterOutput>`

**Input:**
```typescript
interface RouterInput {
  userPrompt: string;
  context?: any;
  agentType?: 'shopping-planner' | 'database-expert';
}
```

**Output:**
```typescript
interface RouterOutput {
  selectedSkills: SkillSelection[];  // 선택된 스킬 목록
  intent: string;                    // 프롬프트 의도
  suggestedApproach: string;         // 권장 접근 방식
}
```

#### 의도 분석 로직

**쇼핑몰 기획 전문가 의도 분류:**

```typescript
private analyzeShoppingPrompt(prompt: string): any {
  const intentPatterns = {
    '신규 기획': /기획|설계|구축|만들자|런칭/i,
    '문제 해결': /문제|어떻게|방법|해결|이슈|장애/i,
    '최적화': /최적화|개선|높이는|낮추는|향상/i,
    '분석': /분석|조사|연구|파악/i,
    '전략 수립': /전략|계획|로드맵|방향/i,
    '마케팅': /마케팅|프로모션|광고|홍보|바이럴/i,
    '고객': /고객|구매자|사용자|회원|전환율|리텐션/i,
    '상품': /상품|제품|카테고리|가격|재고/i
  };

  // 패턴 매칭으로 의도 결정
  for (const [intentName, pattern] of Object.entries(intentPatterns)) {
    if (pattern.test(prompt)) {
      return { intent: intentName, confidence: 0.8 };
    }
  }

  return { intent: '일반 문의', confidence: 0.5 };
}
```

#### 스킬 선택 매핑

**매핑 규칙:**

| 의도 | 스킬 목록 | 우선순위 |
|------|-----------|----------|
| 신규 기획 | target-analysis → competitor-analysis → business-model → category-design | 1-4 |
| 전환율 최적화 | customer-analytics → journey-design → conversion-optimization | 1-3 |
| 마케팅 전략 | channel-strategy → brand-identity → promotion-planning | 1-3 |
| 가격 전략 | competitor-analysis → pricing-strategy | 1-2 |

```typescript
private getShoppingSkillMap(): Record<string, string[]> {
  return {
    '신규 기획': [
      'target-analysis',
      'competitor-analysis',
      'business-model',
      'category-design'
    ],
    '최적화': [
      'customer-analytics',
      'journey-design',
      'conversion-optimization'
    ],
    // ...
  };
}
```

## 3. 스킬 실행기 (skill-executor.ts)

### 역할
선택된 스킬들을 의존성 그래프를 고려하여 순차/병렬로 실행

### 실행 단계

1. **의존성 그래프 구축**
```typescript
private buildDependencyGraph(skillIds: string[]): Map<string, string[]> {
  const graph = new Map<string, string[]>();

  for (const skillId of skillIds) {
    const deps = registry.getDependencies(skillId);
    const filteredDeps = deps.filter(dep => skillIds.includes(dep));
    graph.set(skillId, filteredDeps);
  }

  return graph;
}
```

2. **실행 계획 수립**
의존성이 없는 스킬들을 묶어서 병렬 실행 가능한 페이즈 생성

```typescript
private createExecutionPlan(graph: Map<string, string[]>): ExecutionPhase[] {
  const phases: ExecutionPhase[] = [];
  const executed = new Set<string>();

  while (executed.size < graph.size) {
    const readyNodes: string[] = [];

    for (const [node, dependencies] of graph.entries()) {
      if (!executed.has(node)) {
        const allDepsExecuted = dependencies.every(dep => executed.has(dep));
        if (allDepsExecuted) {
          readyNodes.push(node);
        }
      }
    }

    if (readyNodes.length === 0) {
      throw new Error('순환 의존성 감지됨');
    }

    phases.push({
      skills: readyNodes,
      mode: readyNodes.length > 1 ? 'parallel' : 'sequential'
    });

    readyNodes.forEach(node => executed.add(node));
  }

  return phases;
}
```

3. **스킬 실행 및 컨텍스트 업데이트**

```typescript
private async executePhase(phase: ExecutionPhase, context: any): Promise<SkillResult[]> {
  if (phase.mode === 'parallel') {
    return Promise.all(
      phase.skills.map(skillId => this.executeSkill(skillId, context))
    );
  } else {
    const results: SkillResult[] = [];
    let currentContext = context;

    for (const skillId of phase.skills) {
      const result = await this.executeSkill(skillId, currentContext);
      results.push(result);

      // 성공한 스킬 결과를 컨텍스트에 추가
      if (result.status === 'success') {
        currentContext[skillId] = result.result;
      }
    }

    return results;
  }
}
```

### 실행 순서 예시

**입력:** 신규 쇼핑몰 기획
```
의존성:
- target-analysis: []
- competitor-analysis: [target-analysis]
- business-model: [target-analysis, competitor-analysis]
- category-design: [business-model]
```

**실행 계획:**
```
Phase 1 (sequential): target-analysis
Phase 2 (sequential): competitor-analysis  (target-analysis 결과 필요)
Phase 3 (sequential): business-model        (target, competitor 결과 필요)
Phase 4 (sequential): category-design       (business-model 결과 필요)
```

## 4. 스킬 인터페이스 (types/skill.ts)

모든 스킬은 이 인터페이스를 구현해야 합니다:

```typescript
export interface SkillHandler {
  execute(input: SkillInput): Promise<SkillOutput>;
  getDependencies(): string[];           // 의존성 스킬 ID 목록
  getParameters(): ParameterSchema[];    // 파라미터 스키마
}

export interface SkillInput {
  parameters: Record<string, any>;       // 스킬 파라미터
  context?: any;                         // 이전 스킬 결과 (자동 전달)
}

export interface SkillOutput {
  status: 'success' | 'error' | 'skipped';
  result: any;                           // 스킬 실행 결과
  summary: string;                       // 결과 요약
}

export interface ParameterSchema {
  name: string;
  type: string;                          // 'string', 'number', 'object', 'array'
  required: boolean;
  description?: string;
  default?: any;
}
```

## 5. 스킬 구현 템플릿

```typescript
import type { SkillHandler, SkillInput, SkillOutput } from '@/types/skill';

export class MySkill implements SkillHandler {
  async execute(input: SkillInput): Promise<SkillOutput> {
    const { parameters, context } = input;

    try {
      // 1. 파라미터 추출
      const { param1, param2 } = parameters;

      // 2. 이전 스킬 결과 사용 (context)
      const previousResult = context?.previousSkillId;

      // 3. 실제 로직 실행
      const result = this.doWork(param1, param2, previousResult);

      return {
        status: 'success',
        result,
        summary: '스킬 실행 완료'
      };

    } catch (error) {
      return {
        status: 'error',
        result: null,
        summary: `실패: ${error.message}`
      };
    }
  }

  private doWork(param1: any, param2: any, context: any): any {
    // 비즈니스 로직 구현
    return { /* 결과 */ };
  }

  getDependencies(): string[] {
    // 의존성이 없으면 []
    // 예: ['target-analysis', 'competitor-analysis']
    return [];
  }

  getParameters(): ParameterSchema[] {
    return [
      {
        name: 'param1',
        type: 'string',
        required: true,
        description: '파라미터 설명'
      },
      {
        name: 'param2',
        type: 'number',
        required: false,
        default: 100
      }
    ];
  }
}
```

## 6. 메인 에이전트 전체 코드

```typescript
import { SkillRegistry } from './skill-registry';
import { SkillRouter } from './skill-router';
import { SkillExecutor } from './skill-executor';

export class ShoppingPlannerAgent {
  private router: SkillRouter;
  private executor: SkillExecutor;
  private registry: SkillRegistry;

  constructor(config?: Partial<AgentConfig>, registry?: SkillRegistry) {
    this.registry = registry || new SkillRegistry();
    this.router = new SkillRouter(this.registry);
    this.executor = new SkillExecutor(this.registry);
  }

  async process(userPrompt: string, context?: any): Promise<AgentResponse> {
    // 1. 스킬 라우팅
    const routingResult = await this.router.route({
      userPrompt,
      context,
      agentType: 'shopping-planner'
    });

    // 2. 스킬 실행
    const executionResult = await this.executor.execute({
      selectedSkills: routingResult.selectedSkills,
      userPrompt,
      context
    });

    // 3. 응답 생성
    return this.buildResponse({
      userPrompt,
      routingResult,
      executionResult
    });
  }

  // ... 기타 메서드
}

// 초기화 헬퍼
ShoppingPlannerAgent.initialize(): SkillRegistry {
  const registry = new SkillRegistry();

  // 모든 스킬 import 및 등록
  const skills = [
    { id: 'target-analysis', class: TargetAnalysisSkill },
    { id: 'competitor-analysis', class: CompetitorAnalysisSkill },
    // ...
  ];

  for (const { id, class: SkillClass } of skills) {
    registry.register(id, new SkillClass());
  }

  // 의존성 설정
  registry.setDependencies('target-analysis', []);
  registry.setDependencies('competitor-analysis', ['target-analysis']);
  // ...

  return registry;
}
```

## 7. API 엔드포인트 (Next.js)

```typescript
// app/api/planner/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ShoppingPlannerAgent } from '@/core/main-agent';

export async function POST(request: NextRequest) {
  try {
    const { prompt, context } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'prompt is required' },
        { status: 400 }
      );
    }

    const agent = ShoppingPlannerAgent.create();
    const response = await agent.process(prompt, context);

    return NextResponse.json(response);

  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

## 8. 구현 체크리스트

### 필수 구현 항목

- [ ] `SkillRegistry` 클래스 구현
- [ ] `SkillRouter` 클래스 구현
- [ ] `SkillExecutor` 클래스 구현
- [ ] `ShoppingPlannerAgent` 클래스 구현
- [ ] 8개 핵심 스킬 구현
  - [ ] target-analysis
  - [ ] competitor-analysis
  - [ ] business-model
  - [ ] category-design
  - [ ] customer-analytics
  - [ ] journey-design
  - [ ] conversion-optimization
  - [ ] pricing-strategy
- [ ] Next.js API 엔드포인트 구현
- [ ] 타입 정의 (types/skill.ts)
- [ ] 에러 처리 로직
- [ ] 로깅 시스템

### 의존성 설정

```json
{
  "dependencies": {
    "next": "^14",
    "react": "^18",
    "typescript": "^5"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "eslint": "^8"
  }
}
```

## 9. 테스트 가이드

### 단위 테스트 (스킬별)

```typescript
// skills/shopping-planner/target-analysis/index.test.ts
import { TargetAnalysisSkill } from './index';

describe('TargetAnalysisSkill', () => {
  const skill = new TargetAnalysisSkill();

  test('기본 타겟 분석', async () => {
    const input: SkillInput = {
      parameters: {
        targetAge: '30대',
        targetGender: '여성',
        category: '뷰티'
      }
    };

    const result = await skill.execute(input);

    expect(result.status).toBe('success');
    expect(result.result.persona).toBeDefined();
  });
});
```

### 통합 테스트 (에이전트)

```typescript
describe('ShoppingPlannerAgent', () => {
  test('신규 쇼핑몰 기획 요청', async () => {
    const agent = ShoppingPlannerAgent.create();

    const response = await agent.process(
      "30대 여성 타겟 뷰티 쇼핑몰 기획해줘"
    );

    expect(response.intent).toBe('신규 기획');
    expect(response.executedSkills.length).toBeGreaterThan(0);
    expect(response.result).toBeDefined();
  });
});
```

## 10. 디버깅 팁

### 1. 로그 활성화
```typescript
const agent = new ShoppingPlannerAgent({
  verboseLogging: true  // 상세 로그 출력
});
```

### 2. 스킬 실행 순서 확인
```typescript
// SkillExecutor.execute() 내부에 로그 추가
console.log(`[Phase ${phaseIndex}] 실행: ${phase.skills.join(', ')} (${phase.mode})`);
```

### 3. 컨텍스트 상태 추적
```typescript
console.log(`[Context] 업데이트:`, Object.keys(currentContext));
```

## 11. 성능 최적화

### 캐싱 적용
```typescript
// 메모이제이션 패턴
const cache = new Map<string, AgentResponse>();

async processWithCache(prompt: string): Promise<AgentResponse> {
  const cacheKey = prompt.toLowerCase().trim();

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  const response = await this.process(prompt);
  cache.set(cacheKey, response);
  return response;
}
```

### 스킬 결과 재사용
```typescript
// 이전 실행 결과 저장
private executionCache: Map<string, any> = new Map();

// 동일한 스킬+파라미터는 결과 재사용
```

## 12. 확장 가이드

### 새로운 스킬 추가

1. 스킬 폴더 생성: `skills/shopping-planner/my-skill/`
2. `index.ts` 구현 (SkillHandler 인터페이스 구현)
3. `ShoppingPlannerAgent.initialize()`에 등록 추가
4. 의존성 설정: `registry.setDependencies('my-skill', ['dependant-skill']);`
5. 스킬 라우터 매핑: `skill-router.ts`의 `getShoppingSkillMap()`에 추가

### 새로운 에이전트 추가

1. 새 에이전트 폴더: `agents/my-agent.md`
2. 스킬들 구현: `skills/my-agent/`
3. 새 메인 에이전트 클래스 작성
4. 새 라우터/실행기 (필요시)
5. API 엔드포인트 추가: `app/api/my-agent/route.ts`

## 13. 주의사항

1. **순환 의존성**: 스킬 간 순환 참조는 런타임 에러를 일으킵니다. `createExecutionPlan()`에서 검출됩니다.
2. **파라미터 검증**: 스킬 실행 전에 필수 파라미터 존재 여부 확인
3. **에러 격리**: 한 스킬 실패가 전체를 중단시키지 않도록 `continueOnError` 옵션 고려
4. **타임아웃**: 장시간 실행 스킬은 개별 타임아웃 설정
5. **메모리 누수**: 컨텍스트 객체가 무한히 성장하지 않도록 주기적으로 정리

## 14. 예제: 실제 사용 흐름

```typescript
// 1. 에이전트 생성
const agent = ShoppingPlannerAgent.create();

// 2. 프롬프트 전달
const response = await agent.process(
  "30대 여성 타겟으로 뷰티 쇼핑몰을 처음부터 기획하고 싶어요."
);

console.log('의도:', response.intent);
console.log('실행된 스킬:', response.executedSkills.map(s => s.skillId));
console.log('결과:', response.result);
console.log('소요시간:', response.duration + 'ms');
```

**기대 출력:**
```
의도: 신규 기획
실행된 스킬: ['target-analysis', 'competitor-analysis', 'business-model', 'category-design', 'pricing-strategy']
결과: {
  persona: { name: '지민', age: '30-40대', ... },
  competitors: [...],
  businessModel: { modelType: 'B2C Direct', ... },
  categories: [...],
  pricing: { suggested: '29000', ... }
}
```

## 15. 배포 및 운영

### 환경 변수
```env
# .env.local
AGENT_MAX_EXECUTION_TIME=120000
AGENT_ENABLE_CACHING=true
AGENT_VERBOSE_LOGGING=true
```

### 모니터링
- 스킬 실행 시간 추적
- 에러율 모니터링
- 의존성 사이클 감지
- 메모리 사용량 체크

### 로깅
```typescript
console.log(`[Session:${sessionId}] ${event}`, {
  skillId,
  duration,
  input: truncatedPrompt,
  output: truncatedResult
});
```