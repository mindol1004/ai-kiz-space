# 스킬 실행기 구현 가이드

## 개요

스킬 실행기는 라우터에서 선택된 스킬들을 의존성을 고려하여 실행하고 결과를 통합하는 컴포넌트입니다.

## 아키텍처

```
입력: selectedSkills [{skillId, priority, reason}]
   ↓
의존성 그래프 구축
   ↓
실행 계획 수립 (Phases)
   ↓
스킬 실행 (순차/병렬)
   ↓
컨텍스트 업데이트
   ↓
결과 통합
   ↓
출력: ExecutorOutput
```

## 핵심 클래스

```typescript
export class SkillExecutor {
  private registry: SkillRegistry;
  private maxRetries: number = 1;

  constructor(registry: SkillRegistry) {
    this.registry = registry;
  }

  async execute(input: ExecutorInput): Promise<ExecutorOutput> {
    const { selectedSkills, userPrompt, context } = input;
    const results: SkillResult[] = [];

    // 1. 의존성 그래프 구축
    const skillGraph = this.buildDependencyGraph(
      selectedSkills.map(s => s.skillId)
    );

    // 2. 실행 계획 수립
    const executionPlan = this.createExecutionPlan(skillGraph);

    let currentContext = context || {};

    // 3. 단계별 실행
    for (const phase of executionPlan) {
      const phaseResults = await this.executePhase(phase, currentContext);

      for (const result of phaseResults) {
        results.push({
          ...result,
          duration: Date.now() - startTime
        });
      }

      // 4. 컨텍스트 업데이트
      currentContext = this.updateContext(currentContext, phaseResults);
    }

    // 5. 결과 통합
    const integratedResult = this.integrateResults(results, userPrompt);

    return {
      results,
      integratedResult,
      summary: this.generateSummary(results)
    };
  }
}
```

## 1. 의존성 그래프 구축

### 그래프 구조

```typescript
// 입력: ['target-analysis', 'competitor-analysis', 'business-model']
// 의존성:
//   competitor-analysis → [target-analysis]
//   business-model → [target-analysis, competitor-analysis]

// 출력 graphs:
Map {
  'target-analysis' => [],           // 의존성 없음
  'competitor-analysis' => ['target-analysis'],
  'business-model' => ['target-analysis', 'competitor-analysis']
}
```

### 구현

```typescript
private buildDependencyGraph(skillIds: string[]): Map<string, string[]> {
  const graph = new Map<string, string[]>();

  for (const skillId of skillIds) {
    const deps = this.registry.getDependencies(skillId);
    // 선택된 스킬 목록 내의 의존성만 포함
    const filteredDeps = deps.filter(dep => skillIds.includes(dep));
    graph.set(skillId, filteredDeps);
  }

  return graph;
}
```

**예시:**

```typescript
// registry.setDependencies() 설정:
registry.setDependencies('target-analysis', []);
registry.setDependencies('competitor-analysis', ['target-analysis']);
registry.setDependencies('business-model', ['target-analysis', 'competitor-analysis']);
registry.setDependencies('category-design', ['business-model']);

// 빌드 결과:
Graph = {
  'target-analysis': [],
  'competitor-analysis': ['target-analysis'],
  'business-model': ['target-analysis', 'competitor-analysis'],
  'category-design': ['business-model']
}
```

## 2. 실행 계획 수립 (createExecutionPlan)

### 위상 정렬 (Topological Sort)

의존성이 해결된 스킬들을 묶어서 실행 단계(phase)를 생성합니다.

```typescript
private createExecutionPlan(graph: Map<string, string[]>): ExecutionPhase[] {
  const phases: ExecutionPhase[] = [];
  const executed = new Set<string>();

  while (executed.size < graph.size) {
    // 실행 가능한 스킬 찾기 (모든 의존성이 이미 실행된)
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
      throw new Error('순환 의존성 감지됨 또는 의존성 해결 불가');
    }

    // 병렬/순차 결정
    const mode: 'sequential' | 'parallel' =
      readyNodes.length > 1 ? 'parallel' : 'sequential';

    phases.push({
      skills: readyNodes,
      mode
    });

    readyNodes.forEach(node => executed.add(node));
  }

  return phases;
}
```

### 실행 계획 예시

**입력 스킬:** A → B → C, D → E

```
의존성:
A: []
B: [A]
C: [A]
D: [B]
E: [B, C]

실행 계획:
Phase 1 (sequential): [A]
Phase 2 (parallel): [B, C]          // A가 완료되어 둘 다 실행 가능
Phase 3 (sequential): [D]          // B 필요
Phase 4 (sequential): [E]          // B, C 필요
```

**더 복잡한 예시:**

```
의존성:
S1: []
S2: [S1]
S3: [S1]
S4: [S2, S3]
S5: [S4]
S6: [S1]

실행 계획:
Phase 1 (sequential): [S1]
Phase 2 (parallel): [S2, S3, S6]   // S1 완료 후 모두 실행 가능
Phase 3 (parallel): [S4]           // S2, S3 완료 후 (아직 S5 아님)
Phase 4 (sequential): [S5]         // S4 완료 후
```

## 3. 스킬 실행 (executePhase)

### 순차 실행

```typescript
private async executePhase(
  phase: ExecutionPhase,
  context: any
): Promise<SkillResult[]> {
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

      // 성공한 결과를 컨텍스트에 추가 (다음 스킬에서 사용 가능)
      if (result.status === 'success') {
        currentContext = {
          ...currentContext,
          [skillId]: result.result
        };
      }
    }

    return results;
  }
}
```

### 단일 스킬 실행

```typescript
private async executeSkill(skillId: string, context: any): Promise<SkillResult> {
  const handler = this.registry.get(skillId);

  if (!handler) {
    throw new Error(`스킬 핸들러를 찾을 수 없음: ${skillId}`);
  }

  try {
    const input: SkillInput = {
      parameters: {}, // 라우터에서 추론된 파라미터
      context        // 이전 스킬 결과들
    };

    const output: SkillOutput = await handler.execute(input);

    return {
      skillId,
      result: output.result,
      status: output.status
    };

  } catch (error) {
    console.error(`[SkillExecutor] 스킬 '${skillId}' 실행 실패:`, error);
    throw error;
  }
}
```

## 4. 컨텍스트 관리

### 컨텍스트 업데이트

```typescript
private updateContext(context: any, results: SkillResult[]): any {
  const updatedContext = { ...context };

  for (const result of results) {
    if (result.status === 'success') {
      // 스킬 결과를 컨텍스트에 추가
      updatedContext[result.skillId] = result.result;
    }
  }

  return updatedContext;
}
```

### 컨텍스트 활용 예시

```typescript
// 스킬 1: target-analysis 실행 후
context = {
  initial: { prompt: "..." },
  'target-analysis': {
    persona: { name: '지민', age: '30-40대' },
    segmentation: [...]
  }
}

// 스킬 2: competitor-analysis 실행 시
// target-analysis 결과 자동 전달
const targetResult = context['target-analysis'];
```

## 5. 결과 통합

### 통합 결과 생성

```typescript
private integrateResults(results: SkillResult[], userPrompt: string): any {
  const successfulResults = results.filter(r => r.status === 'success');

  const outputs: Record<string, any> = {};
  successfulResults.forEach(r => {
    outputs[r.skillId] = r.result;
  });

  return {
    userPrompt,
    timestamp: new Date().toISOString(),
    outputs,                    // 각 스킬별 결과
    skillResults: successfulResults.map(r => ({
      skillId: r.skillId,
      duration: r.duration,
      status: r.status
    })),
    summary: this.generateHumanReadableSummary(outputs, userPrompt)
  };
}
```

### 요약 생성

```typescript
private generateHumanReadableSummary(
  outputs: Record<string, any>,
  userPrompt: string
): string {
  const skillNames = Object.keys(outputs);
  const count = skillNames.length;

  let summary = `${count}개 스킬 실행 완료:\n\n`;

  skillNames.forEach((skillId, index) => {
    summary += `${index + 1}. ${skillId}\n`;
    const result = outputs[skillId];

    if (result?.summary) {
      summary += `   - ${result.summary}\n`;
    } else if (result?.schema) {
      summary += `   - ${Object.keys(result.schema).length}개 테이블 설계\n`;
    } else if (result?.persona) {
      summary += `   - 페르소나: ${result.persona.name}\n`;
    }
  });

  return summary;
}
```

## 6. 에러 처리

### 재시도 로직

```typescript
private async executeSkillWithRetry(
  skillId: string,
  context: any,
  maxRetries: number = 1
): Promise<SkillResult> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const result = await this.executeSkill(skillId, context);
      return result;
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries + 1) {
        return {
          skillId,
          result: null,
          status: 'error',
          duration: 0,
          error: lastError.message
        };
      }

      // 백오프
      await new Promise(resolve => setTimeout(resolve, 100 * attempt));
    }
  }

  return {
    skillId,
    result: null,
    status: 'error',
    duration: 0,
    error: lastError?.message || '알 수 없는 오류'
  };
}
```

### 부분 성공 처리

```typescript
// 모든 스킬이 실패해도 전체 results는 반환
// 상태별 집계:
const successCount = results.filter(r => r.status === 'success').length;
const errorCount = results.filter(r => r.status === 'error').length;
const skippedCount = results.filter(r => r.status === 'skipped').length;
```

## 7. 실행 모드

### 순차 실행 (sequential)

- **사용처**: 의존성이 있는 스킬들
- **특징**: 이전 스킬 결과가 다음 스킬에 전달됨
- **장점**: 의존성 보장
- **단점**: 병목 가능성

```
Phase: [A, B] (sequential)
A 실행 → 결과 컨텍스트 업데이트 → B 실행 (A 결과 접근 가능)
```

### 병렬 실행 (parallel)

- **사용처**: 의존성이 없는 독립적 스킬들
- **특징**: 모든 스킬 동시 실행
- **장점**: 성능 향상
- **단점**: 컨텍스트 공유 불가 (각자 동일한 초기 컨텍스트)

```
Phase: [A, B] (parallel)
A 실행 (초기 컨텍스트) ─┐
                       ├→ 결과 수집 → 컨텍스트 업데이트
B 실행 (초기 컨텍스트) ─┘
```

**주의:** 병렬 스킬들은 서로의 결과를 볼 수 없습니다. 순차로 실행되어야 하는 스킬들은 의존성 그래프에서 순차 페이즈로 배치됩니다.

## 8. 의존성 그래프 예시

### 쇼핑몰 기획

```
의존성:
target-analysis: []
competitor-analysis: [target-analysis]
business-model: [target-analysis, competitor-analysis]
category-design: [business-model]
pricing-strategy: [competitor-analysis]

실행 계획:
Phase 1 (sequential): [target-analysis]
Phase 2 (sequential): [competitor-analysis]  ← target-analysis 필요
Phase 3 (parallel): [business-model, pricing-strategy]  ← 각자 의존성 만족
Phase 4 (sequential): [category-design]  ← business-model 필요
```

### 데이터베이스 설계

```
의존성:
data-modeling: []
database-design: [data-modeling]
normalization: [database-design]
indexing-strategy: [database-design]
query-optimization: [performance-monitoring]

실행 계획:
Phase 1: [data-modeling]
Phase 2: [database-design]
Phase 3 (parallel): [normalization, indexing-strategy]
Phase 4: [performance-monitoring]
Phase 5: [query-optimization]
```

## 9. 성능 최적화

### 1. 의존성 최소화
```typescript
// 나쁜 예: 과도한 의존성
registry.setDependencies('business-model', ['target-analysis', 'competitor-analysis', 'data-modeling', 'pricing-strategy']);

// 좋은 예: 필요한 의존성만
registry.setDependencies('business-model', ['target-analysis', 'competitor-analysis']);
```

### 2. 병렬화 기회 포착
```typescript
// 의존성이 없는 스킬들은 자동으로 병렬 실행
phase.mode === 'parallel' // 자동 설정
```

### 3. 캐싱
```typescript
private resultCache = new Map<string, any>();

private getCacheKey(skillId: string, parameters: any): string {
  return `${skillId}:${JSON.stringify(parameters)}`;
}
```

## 10. 테스트

### 단위 테스트

```typescript
describe('SkillExecutor', () => {
  let executor: SkillExecutor;
  let mockRegistry: SkillRegistry;

  beforeEach(() => {
    mockRegistry = new SkillRegistry();
    executor = new SkillExecutor(mockRegistry);
  });

  test('의존성에 따른 순차 실행', async () => {
    // Mock 스킬들 등록
    mockRegistry.register('skill-A', new MockSkillA());
    mockRegistry.register('skill-B', new MockSkillB());
    mockRegistry.setDependencies('skill-B', ['skill-A']);

    const result = await executor.execute({
      selectedSkills: [
        { skillId: 'skill-A', priority: 1, reason: '' },
        { skillId: 'skill-B', priority: 2, reason: '' }
      ],
      userPrompt: 'test'
    });

    expect(result.results[0].skillId).toBe('skill-A');
    expect(result.results[1].skillId).toBe('skill-B');
  });

  test('병렬 실행', async () => {
    mockRegistry.register('skill-A', new MockSkillA());
    mockRegistry.register('skill-B', new MockSkillB());

    const result = await executor.execute({
      selectedSkills: [
        { skillId: 'skill-A', priority: 1, reason: '' },
        { skillId: 'skill-B', priority: 1, reason: '' }
      ],
      userPrompt: 'test'
    });

    // 두 스킬이 동시 실행되어야 함
    expect(result.results.length).toBe(2);
  });
});
```

### 통합 테스트

```typescript
test('전체 실행 파이프라인', async () => {
  const agent = new ShoppingPlannerAgent();
  const response = await agent.process('뷰티 쇼핑몰 기획');

  expect(response.status).toBe('success');
  expect(response.executedSkills).toHaveLength(4);
  expect(response.result.outputs).toHaveProperty('target-analysis');
});
```

## 11. 디버깅

### 실행 로그

```typescript
private async executePhase(phase: ExecutionPhase, context: any): Promise<SkillResult[]> {
  console.log(`[Phase] ${phase.mode}: ${phase.skills.join(', ')}`);
  console.log(`[Context] Keys: ${Object.keys(context).join(', ')}`);

  // 실행 후
  console.log(`[Phase Complete] Results:`, results.map(r => ({
    skill: r.skillId,
    status: r.status,
    duration: r.duration
  })));
}
```

### 의존성 순환 감지

```typescript
// createExecutionPlan에서 이미 감지
if (readyNodes.length === 0 && executed.size < graph.size) {
  const remaining = Array.from(graph.keys()).filter(k => !executed.has(k));
  console.error('순환 의존성:', remaining);
  throw new Error(`순환 의존성: ${remaining.join(' → ')}`);
}
```

## 12. 주의사항

1. **순환 의존성**: 의존성 사이클은 런타임 에러를 일으킵니다. 스킬 등록 시 확인 필요
2. **의존성 누락**: 등록되지 않은 스킬을 의존성으로 지정하면 경고만 출력, 실행 시 스킵됨
3. **컨텍스트 크기**: 모든 스킬 결과가 컨텍스트에 쌓이므로 메모리 누수 가능성
4. **에러 격리**: 한 스킬 실패가 다른 스킬에 영향 안 주도록 설계됨
5. **병렬 안전성**: 병렬 실행 시 컨텍스트 전달 안됨 (의존성이 없어야 함)

## 13. 성능 메트릭

```typescript
interface ExecutionMetrics {
  totalDuration: number;
  skillCount: number;
  successCount: number;
  errorCount: number;
  skippedCount: number;
  averageSkillDuration: number;
  phaseMetrics: PhaseMetric[];
}

interface PhaseMetric {
  phaseIndex: number;
  mode: 'sequential' | 'parallel';
  skillCount: number;
  duration: number;
}
```

## 14. API 참조

### ExecutorInput

```typescript
interface ExecutorInput {
  selectedSkills: {
    skillId: string;
    priority: number;
    reason: string;
    parameters?: any;
  }[];
  userPrompt: string;
  context?: any;
  dbType?: string;  // DB 전문가용
}
```

### ExecutorOutput

```typescript
interface ExecutorOutput {
  results: SkillResult[];
  integratedResult: {
    userPrompt: string;
    timestamp: string;
    outputs: Record<string, any>;
    skillResults: Array<{ skillId: string; duration: number; status: string }>;
    summary: string;
  };
  summary: string;
}
```

### SkillResult

```typescript
interface SkillResult {
  skillId: string;
  result: any;
  status: 'success' | 'error' | 'skipped';
  duration: number;
  error?: string;
}
```