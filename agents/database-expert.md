# 데이터베이스 전문가 에이전트 (Database Expert Agent)

## 역할

사용자 프롬프트를 입력받아 **스킬 라우터**를 통해 관련 스킬을 선택하고, **스킬 실행기**를 통해 해당 스킬들을 실행한 후, 통합된 결과를 반환합니다. 데이터베이스 설계, 최적화, 모델링, 성능 관리 등 종합적인 데이터베이스 솔루션을 제공하는 전문가 에이전트의 중앙 컨트롤러 역할을 합니다.

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
│  database-design  query-optimization  data-modeling        │
│  performance-monitoring  indexing-strategy  normalization  │
│  ... (12개 스킬)                                            │
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
  dbType?: string;             // 데이터베이스 타입 (postgresql, mysql, mongodb 등)
}

class DatabaseExpertAgent {
  private router: SkillRouter;
  private executor: SkillExecutor;
  private registry: SkillRegistry;
  private config: AgentConfig;

  constructor(config?: Partial<AgentConfig>) {
    this.config = {
      maxExecutionTime: 180000,  // 3분
      enableCaching: true,
      verboseLogging: true,
      dbType: 'postgresql',
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
        context,
        dbType: this.config.dbType
      });

      console.log(`[${sessionId}] 선택된 스킬: ${routingResult.selectedSkills.map(s => s.skillId).join(', ')}`);

      // 2단계: 스킬 실행
      console.log(`[${sessionId}] 스킬 실행 중...`);
      const executionResult = await this.executor.execute({
        selectedSkills: routingResult.selectedSkills,
        userPrompt,
        context,
        dbType: this.config.dbType
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
        successCount: input.executionResult.results.filter(r => r.status === 'success').length,
        dbType: this.config.dbType
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
    return `DB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

## 사용 예시

### 예시 1: 새 프로젝트 데이터베이스 설계

```typescript
const agent = new DatabaseExpertAgent({ dbType: 'postgresql' });

const response = await agent.process(
  "이커머스 플랫폼을 위한 데이터베이스 설계가 필요해요. 상품, 주문, 사용자 정보를 저장할 테이블 구조를 만들어주세요."
);

console.log(response);
```

**실행 흐름**:

1. **프롬프트 분석**
   ```
   의도: 데이터베이스 설계
   키워드: 이커머스, 플랫폼, 테이블, 상품, 주문, 사용자
   DB 타입: PostgreSQL
   ```

2. **스킬 선택**
   - data-modeling (데이터 모델링)
   - database-design (데이터베이스 설계)
   - normalization (정규화)
   - indexing-strategy (인덱싱 전략)

3. **스킬 실행** (순차)
   ```
   data-modeling → database-design → normalization → indexing-strategy
   ```

4. **결과 반환**
   ```json
   {
     "intent": "이커머스 플랫폼 데이터베이스 설계",
     "executedSkills": [...],
     "result": {
       "schema": {
         "users": ["id", "email", "password", "name", "created_at"],
         "products": ["id", "name", "price", "category_id", "stock"],
         "orders": ["id", "user_id", "total_amount", "status", "created_at"],
         "order_items": ["id", "order_id", "product_id", "quantity", "price"]
       },
       "indexes": ["users(email)", "products(category_id)", "orders(user_id)"],
       "normalization": "3NF 준수, 외래 키 제약조건 적용",
       "recommendations": "JSONB 타입 활용, 파티셔닝 고려"
     }
   }
   ```

### 예시 2: 쿼리 성능 문제 해결

```typescript
const response = await agent.process(
  "상품 목록 조회 쿼리가 너무 느려요. 데이터가 100만 개 이상인데 성능을 어떻게 개선할 수 있을까요?"
);
```

**실행 흐름**:

1. **프롬프트 분석**
   ```
   의도: 쿼리 최적화
   키워드: 느림, 성능, 조회, 100만 개
   DB 타입: PostgreSQL
   ```

2. **스킬 선택**
   - query-optimization (쿼리 최적화)
   - performance-monitoring (성능 모니터링)
   - indexing-strategy (인덱싱 전략)

3. **스킬 실행** (순차 + 병렬 혼합)
   ```
   performance-monitoring → (query-optimization + indexing-strategy)
   ```

### 예시 3: 데이터베이스 마이그레이션

```typescript
const response = await agent.process(
  "기존 MySQL에서 PostgreSQL로 마이그레이션해야 해요. 데이터 손실 없이 안전하게 이동하는 방법이 궁금해요."
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

class DatabasePromptProcessor implements PromptProcessor {
  preprocess(prompt: string): string {
    return prompt
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  }

  extractIntent(prompt: string): Intent {
    const intentPatterns = {
      '데이터베이스 설계': /설계|구조|스키마|테이블/i,
      '쿼리 최적화': /쿼리|성능|느림|빠르게|최적화/i,
      '데이터 모델링': /모델링|ERD|관계|엔티티/i,
      '성능 모니터링': /모니터링|진단|분석|메트릭/i,
      '인덱싱': /인덱스|색인|검색|빠른조회/i,
      '정규화': /정규화|중복|1NF|2NF|3NF/i,
      '스키마 마이그레이션': /마이그레이션|이전|변경|업그레이드/i,
      '문제 해결': /에러|문제|오류|이슈|해결/i,
      '용량 계획': /용량|예측|스케일|확장/i,
      '보안': /보안|권한|암호화|인증/i,
      '백업 복구': /백업|복구|재해|안정성/i,
      '복제 샤딩': /복제|리플리카|샤딩|분산/i
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

    // DB 타입 추출
    const dbTypes = ['postgresql', 'mysql', 'mongodb', 'oracle', 'sqlserver'];
    for (const dbType of dbTypes) {
      if (prompt.includes(dbType)) {
        entities.push({ type: 'dbType', value: dbType });
      }
    }

    // 데이터 크기 추출
    const sizeMatch = prompt.match(/(\d+(?:,\d{3})*)\s*(개|건|행|레코드)/);
    if (sizeMatch) {
      entities.push({ type: 'dataSize', value: sizeMatch[0] });
    }

    // 테이블/엔티티 추출
    const tableKeywords = ['사용자', '상품', '주문', '카테고리', '결제', '배송', '리뷰', '장바구니'];
    for (const keyword of tableKeywords) {
      if (prompt.includes(keyword)) {
        entities.push({ type: 'entity', value: keyword });
      }
    }

    // 문제 키워드 추출
    const problemKeywords = ['느림', '느려', '빠르게', '에러', '오류', '문제', '버그', '이슈'];
    for (const keyword of problemKeywords) {
      if (prompt.includes(keyword)) {
        entities.push({ type: 'problem', value: keyword });
      }
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
    dbType?: string;
    error?: boolean;
  };
}
```

## API 인터페이스

```typescript
// HTTP API (예: Next.js API Route)
interface AgentAPI {
  POST /api/database-expert
    request: { prompt: string; context?: any; dbType?: string }
    response: AgentResponse
}
```

```typescript
// Next.js API Route 예시
import { DatabaseExpertAgent } from '@/agents/database-expert';

export async function POST(request: Request) {
  const { prompt, context, dbType } = await request.json();

  const agent = new DatabaseExpertAgent({ dbType: dbType || 'postgresql' });
  const response = await agent.process(prompt, context);

  return Response.json(response);
}
```

## 에이전트 초기화

```typescript
// 단일 에이전트 인스턴스 (전역)
let agent: DatabaseExpertAgent | null = null;

function getAgent(dbType?: string): DatabaseExpertAgent {
  if (!agent) {
    agent = new DatabaseExpertAgent({
      maxExecutionTime: 180000,  // 3분
      enableCaching: true,
      verboseLogging: true,
      dbType: dbType || 'postgresql'
    });
  }
  return agent;
}

// 사용
const response = await getAgent('postgresql').process("이커머스 DB 설계해줘");
```

## 파일 구조

```
/workspace/
├── agents/
│   └── database-expert.md         # 에이전트 정의
├── skills/
│   └── database-expert/
│       ├── README.md               # 스킬 목록
│       ├── database-design/
│       │   └── index.ts            # 테이블 설계, 관계 정의
│       ├── query-optimization/
│       │   └── index.ts            # SQL 쿼리 최적화
│       ├── data-modeling/
│       │   └── index.ts            # ERD 작성, 엔티티 관계
│       ├── performance-monitoring/
│       │   └── index.ts            # 성능 진단, 모니터링
│       ├── indexing-strategy/
│       │   └── index.ts            # 인덱스 설계 및 권고
│       ├── normalization/
│       │   └── index.ts            # 정규화 검토 및 개선
│       ├── schema-migration/
│       │   └── index.ts            # 스키마 변경 관리
│       ├── security-optimization/
│       │   └── index.ts            # 보안 최적화
│       ├── backup-recovery/
│       │   └── index.ts            # 백업 및 복구 전략
│       ├── replication-sharding/
│       │   └── index.ts            # 복제 및 샤딩 설계
│       └── capacity-planning/
│           └── index.ts            # 용량 계획 및 예측
└── core/
    ├── skill-router.md             # 스킬 라우터 (확장 필요)
    ├── skill-executor.md           # 스킬 실행기
    └── main-agent.md               # 메인 에이전트 (기존 쇼핑몰 버전)
```

## 주의사항

- **DB 타입**: PostgreSQL, MySQL, MongoDB 등 DBMS 타입에 따라 스킬 동작이 달라집니다.
- **순환 의존성**: 스킬 간 순환 참조가 발생하면 에러를 반환합니다.
- **실행 시간**: `maxExecutionTime`을 초과하면 타임아웃 에러를 반환합니다.
- **캐싱**: 동일한 프롬프트는 캐시된 결과를 반환합니다 (`enableCaching: true`).
- **로깅**: 상세 로그는 `verboseLogging: true`일 때만 출력됩니다.