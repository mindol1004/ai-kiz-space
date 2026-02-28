# 메인 에이전트 (Main Agent)

## 역할

사용자 프롬프트를 입력받아 **스킬 라우터**를 통해 관련 스킬을 선택하고, **스킬 실행기**를 통해 해당 스킬들을 실행한 후, 통합된 결과를 반환합니다. 쇼핑몰 기획 전문가 에이전트의 중앙 컨트롤러 역할을 합니다.

## 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                      사용자 프롬프트                          │
└─────────────────────┬───────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                      메인 에이전트                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  1. 프롬프트 수신                                      │   │
│  │  2. 컨텍스트 구축                                     │   │
│  │  3. 스킬 라우터 호출                                  │   │
│  │  4. 스킬 실행기 호출                                  │   │
│  │  5. 결과 통합 및 반환                                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                     스킬 라우터                              │
│  - 프롬프트 의도 분석                                        │
│  - 관련 스킬 선택                                            │
│  - 실행 순서 결정                                            │
└─────────────────────┬───────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                     스킬 실행기                              │
│  - 스킬 순차/병렬 실행                                       │
│  - 의존성 관리                                              │
│  - 에러 처리                                                │
└─────────────────────┬───────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    개별 스킬들                               │
│  target-analysis  competitor-analysis  category-design      │
│  pricing-strategy  journey-design  channel-strategy         │
│  ... (24개 스킬)                                            │
└─────────────────────┬───────────────────────────────────────┘
```

## 메인 에이전트 코드

```typescript
import { SkillRouter } from './skill-router';
import { SkillExecutor } from './skill-executor';
import { SkillRegistry } from './skill-registry';

interface AgentConfig {
  maxExecutionTime: number;     // 최대 실행 시간 (ms)
  enableCaching: boolean;       // 캐싱 활성화
  verboseLogging: boolean;      // 상세 로깅
}

class ShoppingPlannerAgent {
  private router: SkillRouter;
  private executor: SkillExecutor;
  private registry: SkillRegistry;
  private config: AgentConfig;

  constructor(config?: Partial<AgentConfig>) {
    this.config = {
      maxExecutionTime: 120000,  // 2분
      enableCaching: true,
      verboseLogging: true,
      ...config
    };

    this.registry = new SkillRegistry();
    this.router = new SkillRouter(this.registry);
    this.executor = new SkillExecutor(this.registry);
  }

  async process(userPrompt: string, context?: any): Promise<AgentResponse> {
    const startTime = Date.now();
    const sessionId = this.generateSessionId();

    console.log(`[${sessionId}] 프롬프트 수신: ${userPrompt}`);

    try {
      // 1단계: 스킬 라우팅
      console.log(`[${sessionId}] 스킬 라우팅 중...`);
      const routingResult = await this.router.route({
        userPrompt,
        context
      });

      console.log(`[${sessionId}] 선택된 스킬: ${routingResult.selectedSkills.map(s => s.skillId).join(', ')}`);

      // 2단계: 스킬 실행
      console.log(`[${sessionId}] 스킬 실행 중...`);
      const executionResult = await this.executor.execute({
        selectedSkills: routingResult.selectedSkills,
        userPrompt,
        context
      });

      // 3단계: 결과 통합
      const response = this.buildResponse({
        userPrompt,
        routingResult,
        executionResult,
        sessionId,
        duration: Date.now() - startTime
      });

      console.log(`[${sessionId}] 완료 (${response.duration}ms)`);

      return response;

    } catch (error) {
      return this.handleError(error, sessionId, userPrompt);
    }
  }

  private buildResponse(input: {
    userPrompt: string;
    routingResult: RoutingResult;
    executionResult: ExecutionResult;
    sessionId: string;
    duration: number;
  }): AgentResponse {
    return {
      sessionId: input.sessionId,
      timestamp: new Date().toISOString(),
      intent: input.routingResult.intent,
      suggestedApproach: input.routingResult.suggestedApproach,
      executedSkills: input.executionResult.results.map(r => ({
        skillId: r.skillId,
        status: r.status
      })),
      result: input.executionResult.integratedResult,
      summary: input.executionResult.summary,
      duration: input.duration,
      metadata: {
        skillCount: input.routingResult.selectedSkills.length,
        successCount: input.executionResult.results.filter(r => r.status === 'success').length
      }
    };
  }

  private handleError(error: Error, sessionId: string, userPrompt: string): AgentResponse {
    console.error(`[${sessionId}] 에러: ${error.message}`);

    return {
      sessionId,
      timestamp: new Date().toISOString(),
      intent: '에러',
      suggestedApproach: '문제가 발생했습니다. 다시 시도하거나 질문을 수정해주세요.',
      executedSkills: [],
      result: {
        error: true,
        message: error.message,
        suggestion: '입력하신 내용을 다시 확인하거나 더 구체적으로 질문해주세요.'
      },
      summary: `실행 중 오류 발생: ${error.message}`,
      duration: 0,
      metadata: {
        skillCount: 0,
        successCount: 0,
        error: true
      }
    };
  }

  private generateSessionId(): string {
    return `SP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

## 사용 예시

### 예시 1: 신규 쇼핑몰 종합 기획

```typescript
const agent = new ShoppingPlannerAgent();

const response = await agent.process(
  "30대 여성 타겟으로 뷰티 쇼핑몰을 처음부터 기획하고 싶어요. 경쟁사 분석하고 카테고리 구조도設計해줘."
);

console.log(response);
```

**실행 흐름**:

1. **프롬프트 분석**
   ```
   의도: 신규 뷰티 쇼핑몰 종합 기획
   키워드: 30대 여성, 뷰티, 쇼핑몰, 기획, 경쟁사, 카테고리
   ```

2. **스킬 선택**
   - target-analysis (타겟 분석)
   - competitor-analysis (경쟁사 분석)
   - business-model (비즈니스 모델)
   - category-design (카테고리 설계)
   - portfolio-strategy (포트폴리오 전략)
   - pricing-strategy (가격 전략)

3. **스킬 실행** (순차)
   ```
   target-analysis → competitor-analysis → business-model 
   → category-design → portfolio-strategy → pricing-strategy
   ```

4. **결과 반환**
   ```json
   {
     "intent": "신규 뷰티 쇼핑몰 종합 기획",
     "executedSkills": [...],
     "result": {
       "타겟": "30대 여성, 뷰티 관심度高, 월 소득 400-600만",
       "경쟁사": "올리브영, 처방, 위메프, 쿠팡",
       "모델": "직접판매 + 정기구독",
       "카테고리": "스킨케어 40%, 메이크업 30%, 향수 20%, 디바이스 10%",
       "가격대": "중가(3-5만원대 중심)"
     }
   }
   ```

### 예시 2: 전환율 최적화

```typescript
const response = await agent.process(
  "우리 쇼핑몰 전환율이 너무 낮아요. 1%대에서 안 올라가요."
);
```

**실행 흐름**:

1. **프롬프트 분석**
   ```
   의도: 전환율 최적화
   키워드: 전환율, 낮음, 문제해결
   ```

2. **스킬 선택**
   - customer-analytics (고객 분석)
   - journey-design (여정 설계)
   - conversion-optimization (전환율 최적화)
   - personalization (개인화)

3. **스킬 실행** (순차 + 병렬 혼합)
   ```
   customer-analytics → (journey-design + conversion-optimization) → personalization
   ```

### 예시 3: 마케팅 전략

```typescript
const response = await agent.process(
  "신규 쇼핑몰 런칭marketing strategy 세워줘. 예산은 한달에 500만원 정도야."
);
```

## 프롬프트 처리 알고리즘

```typescript
interface PromptProcessor {
  preprocess(prompt: string): string;        // 전처리
  extractIntent(prompt: string): Intent;     // 의도 추출
  extractEntities(prompt: string): Entity[]; // 개체 추출
  generateParameters(prompt: string): any;   // 파라미터 추출
}

class DefaultPromptProcessor implements PromptProcessor {
  preprocess(prompt: string): string {
    return prompt
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  }

  extractIntent(prompt: string): Intent {
    const intentPatterns = {
      '신규 기획': /기획|설계|구축|만들자/i,
      '문제 해결': /문제|어떻게|방법|해결/i,
      '최적화': /최적화|개선|높이는|낮추는/i,
      '분석': /분석|조사|연구/i,
      '전략 수립': /전략|계획|로드맵/i,
      '운영 가이드': /운영|관리|프로세스/i
    };

    for (const [intent, pattern] of Object.entries(intentPatterns)) {
      if (pattern.test(prompt)) {
        return { type: intent, confidence: 0.8 };
      }
    }

    return { type: '일반 문의', confidence: 0.5 };
  }

  extractEntities(prompt: string): Entity[] {
    const entities: Entity[] = [];

    // 타겟 추출
    const targetMatch = prompt.match(/((\d+)대\s*(여성|남성|전체))/);
    if (targetMatch) {
      entities.push({ type: 'target', value: targetMatch[1] });
    }

    // 카테고리 추출
    const categoryKeywords = ['뷰티', '패션', '식품', '생활', '전자', '유아', '스포츠'];
    for (const category of categoryKeywords) {
      if (prompt.includes(category)) {
        entities.push({ type: 'category', value: category });
      }
    }

    // 예산 추출
    const budgetMatch = prompt.match(/(\d+(?:,\d{3})*)\s*(만원|천원|원)/);
    if (budgetMatch) {
      entities.push({ type: 'budget', value: budgetMatch[0] });
    }

    return entities;
  }

  generateParameters(prompt: string): any {
    const entities = this.extractEntities(prompt);
    const params: Record<string, any> = {};

    for (const entity of entities) {
      params[entity.type] = entity.value;
    }

    return params;
  }
}
```

## 응답 포맷

```typescript
interface AgentResponse {
  sessionId: string;           // 세션 ID
  timestamp: string;           // 타임스탬프
  intent: string;              // 의도 요약
  suggestedApproach: string;   // 권장 접근방식
  executedSkills: {            // 실행된 스킬 목록
    skillId: string;
    status: 'success' | 'error' | 'skipped';
  }[];
  result: any;                 // 통합 결과
  summary: string;             // 결과 요약
  duration: number;            // 실행 시간 (ms)
  metadata: {                  // 메타데이터
    skillCount: number;
    successCount: number;
    error?: boolean;
  };
}
```

## API 인터페이스

```typescript
// HTTP API (예: Next.js API Route)
interface AgentAPI {
  POST /api/planner
    request: { prompt: string; context?: any }
    response: AgentResponse
}
```

```typescript
// Next.js API Route 예시
import { ShoppingPlannerAgent } from '@/core/main-agent';

export async function POST(request: Request) {
  const { prompt, context } = await request.json();
  
  const agent = new ShoppingPlannerAgent();
  const response = await agent.process(prompt, context);
  
  return Response.json(response);
}
```

## 에이전트 초기화

```typescript
// 단일 에이전트 인스턴스 (전역)
let agent: ShoppingPlannerAgent | null = null;

function getAgent(): ShoppingPlannerAgent {
  if (!agent) {
    agent = new ShoppingPlannerAgent({
      maxExecutionTime: 180000,  // 3분
      enableCaching: true,
      verboseLogging: true
    });
  }
  return agent;
}

// 사용
const response = await getAgent().process("뷰티 쇼핑몰 기획해줘");
```

## 파일 구조

```
/workspace/
├── agents/
│   └── shopping-planner.md         # 에이전트 정의
├── skills/
│   └── shopping-planner/
│       ├── README.md               # 스킬 목록
│       ├── strategy/
│       │   ├── target-analysis.md
│       │   ├── competitor-analysis.md
│       │   ├── business-model.md
│       │   └── growth-strategy.md
│       ├── product/
│       │   ├── category-design.md
│       │   ├── portfolio-strategy.md
│       │   ├── pricing-strategy.md
│       │   └── seasonal-trend.md
│       └── ... (총 24개 스킬)
└── core/
    ├── skill-router.md             # 스킬 라우터
    ├── skill-executor.md           # 스킬 실행기
    └── main-agent.md               # 메인 에이전트
```

## 주의사항

- **순환 의존성**: 스킬 간 순환 참조가 발생하면 에러를 반환합니다.
- **실행 시간**: `maxExecutionTime`을 초과하면 타임아웃 에러를 반환합니다.
- **캐싱**: 동일한 프롬프트는 캐시된 결과를 반환합니다 (`enableCaching: true`).
- **로깅**: 상세 로그는 `verboseLogging: true`일 때만 출력됩니다.
