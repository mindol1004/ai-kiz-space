# 스킬 실행기 (Skill Executor)

## 역할

선택된 스킬들을 **순차적 또는 병렬적으로 실행**하고, 각 스킬의 결과를 수집하여 통합합니다. 스킬 간의 의존성 관리와 에러 처리도 담당합니다.

## 입력 형식

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
}
```

## 출력 형식

```typescript
interface ExecutorOutput {
  results: {
    skillId: string;
    result: any;
    status: "success" | "error" | "skipped";
    duration: number;
  }[];
  integratedResult: any;
  summary: string;
}
```

## 실행 모드

### 1. 순차 실행

**스킬 간 의존성이 있거나**, 이전 결과가 다음 스킬의 입력으로 필요한 경우 사용합니다.

```
타겟 분석 → 경쟁 분석 → 비즈니스 모델 → 카테고리 설계
```

실행 로직:
1. 첫 번째 스킬 실행
2. 결과 확인 및 검증
3. 결과가 다음 스킬의 입력으로 전달
4. 다음 스킬 실행
5. 최종 결과 수신

### 2. 병렬 실행

**스킬 간 의존성이 없고**, 독립적으로 실행 가능한 경우 사용합니다.

```
주문 프로세스 최적화 + 배송 관리 개선 + 반품 정책 수립
```

실행 로직:
1. 독립 스킬 동시 실행
2. 모든 결과 수신
3. 결과 통합

### 3. 혼합 실행

순차와 병렬을 조합하여 최적의 실행 전략을 수립합니다.

```
(순차) 분석 스킬들 → (병렬) 설계 스킬들 → (순차) 실행 스킬들
```

실행 로직:
1. 1단계: 분석 스킬 순차 실행
2. 2단계: 설계 스킬 병렬 실행
3. 3단계: 실행 스킬 순차 실행

## 스킬 실행 클래스

```typescript
class SkillExecutor {
  private skillRegistry: Map<string, SkillHandler>;

  async execute(input: ExecutorInput): Promise<ExecutorOutput> {
    const { selectedSkills, userPrompt, context } = input;
    const startTime = Date.now();
    const results = [];

    try {
      // 의존성 그래프 구축
      const skillGraph = this.buildDependencyGraph(selectedSkills);

      // 실행 계획 수립
      const executionPlan = this.createExecutionPlan(skillGraph);

      let currentContext = context || {};

      // 스킬 순차/병렬 실행
      for (const phase of executionPlan) {
        const phaseResults = await this.executePhase(phase, currentContext);
        
        for (const result of phaseResults) {
          results.push({
            ...result,
            duration: Date.now() - startTime
          });
        }

        // 컨텍스트 업데이트
        currentContext = this.updateContext(currentContext, phaseResults);
      }

      // 결과 통합
      const integratedResult = this.integrateResults(results, userPrompt);

      return {
        results,
        integratedResult,
        summary: this.generateSummary(results)
      };

    } catch (error) {
      return {
        results,
        integratedResult: { error: error.message },
        summary: `실행 중 오류 발생: ${error.message}`
      };
    }
  }

  private buildDependencyGraph(skills: Skill[]): DependencyGraph {
    // 스킬 간 의존성 그래프 구축
    const graph = new DependencyGraph();
    
    for (const skill of skills) {
      const dependencies = this.getDependencies(skill.skillId);
      graph.addNode(skill.skillId, dependencies);
    }
    
    return graph;
  }

  private createExecutionPlan(graph: DependencyGraph): ExecutionPhase[] {
    const phases: ExecutionPhase[] = [];
    const executed = new Set<string>();

    while (executed.size < graph.getNodeCount()) {
      const readyNodes = graph.getNodesWithNoPendingDependencies(executed);
      
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
        currentContext = this.updateContext(currentContext, [result]);
      }

      return results;
    }
  }

  private async executeSkill(skillId: string, context: any): Promise<SkillResult> {
    const handler = this.skillRegistry.get(skillId);
    
    if (!handler) {
      return {
        skillId,
        result: null,
        status: 'skipped',
        error: '스킬 핸들러를 찾을 수 없음'
      };
    }

    try {
      const result = await handler.execute(context);
      return {
        skillId,
        result,
        status: 'success'
      };
    } catch (error) {
      return {
        skillId,
        result: null,
        status: 'error',
        error: error.message
      };
    }
  }

  private integrateResults(results: SkillResult[], userPrompt: string): IntegratedResult {
    // 스킬별 결과 수집
    const skillOutputs: Record<string, any> = {};
    
    for (const result of results) {
      if (result.status === 'success') {
        skillOutputs[result.skillId] = result.result;
      }
    }

    // 최종 통합 결과 생성
    return {
      userPrompt,
      timestamp: new Date().toISOString(),
      outputs: skillOutputs,
      summary: this.generateSummary(results)
    };
  }

  private updateContext(context: any, results: SkillResult[]): any {
    const updatedContext = { ...context };
    
    for (const result of results) {
      if (result.status === 'success') {
        updatedContext[result.skillId] = result.result;
      }
    }
    
    return updatedContext;
  }

  private generateSummary(results: SkillResult[]): string {
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    
    return `${results.length}개 스킬 중 ${successCount}개 성공, ${errorCount}개 실패`;
  }
}
```

## 에러 처리

### 1. 스킬 실패 시 대응

```typescript
interface ErrorHandlingStrategy {
  onSkillError(skillId: string, error: Error): ErrorAction;
}

enum ErrorAction {
  RETRY = 'retry',       // 재시도
  SKIP = 'skip',         // 스킵
  ABORT = 'abort',       // 전체 중단
  CONTINUE = 'continue'  // 계속 진행
}
```

### 2. 재시도 로직

```typescript
async function executeWithRetry(
  skill: Skill,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<SkillResult> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await executeSkill(skill);
    } catch (error) {
      if (attempt === maxRetries) {
        return {
          skillId: skill.skillId,
          status: 'error',
          error: `재시도 ${maxRetries}회 실패: ${error.message}`
        };
      }
      await delay(delay * attempt); // 지수 백오프
    }
  }
}
```

### 3. 부분 성공 처리

```markdown
## 부분 성공 시나리오

**경우**: 4개 스킬 중 1개 실패

**대응**:
1. 실패한 스킬은 에러 로그에 기록
2. 나머지 3개 스킬 결과로 진행
3. 최종 결과에 실패 스킬 표시
4. 사용자에게 알림

**출력 예시**:
```
✅ 타겟 분석: 완료
✅ 경쟁 분석: 완료
❌ 비즈니스 모델: 실패 (시간 초과)
✅ 카테고리 설계: 완료

⚠️ 1개 스킬 실패, 부분 결과 제공
```
```

## 사용 예시

### 예시 1: 신규 쇼핑몰 기획

```
입력: {
  selectedSkills: [
    { skillId: "target-analysis", priority: 1 },
    { skillId: "competitor-analysis", priority: 2 },
    { skillId: "business-model", priority: 3 },
    { skillId: "category-design", priority: 4 }
  ],
  userPrompt: "30대 여성 뷰티 쇼핑몰 기획"
}

실행 흐름:
1. target-analysis → 타겟 페르소나 결과
2. competitor-analysis (target 결과 활용) → 경쟁사 분석
3. business-model → 비즈니스 모델 제안
4. category-design (competition 결과 활용) → 카테고리 구조

출력:
{
  integratedResult: {
    타겟: "30대 여성, 뷰티 관심度高",
    경쟁사: "올리브영, 처방, 위메프 등",
    모델: "직접 판매 + 정기구독",
    카테고리: "스킨케어 40%, 메이크업 30%, 향수 20%, 디바이스 10%"
  }
}
```

### 예시 2: 전환율 최적화

```
입력: {
  selectedSkills: [
    { skillId: "customer-analytics", priority: 1 },
    { skillId: "journey-design", priority: 2 },
    { skillId: "conversion-optimization", priority: 3 },
    { skillId: "personalization", priority: 4 }
  ]
}

실행: (병렬) customer-analytics + journey-design → (순차) conversion-optimization → personalization
```

## 결과 포맷

### 통합 결과 템플릿

```markdown
## 쇼핑몰 기획 결과

### 1. 분석 결과
**타겟 고객**: 30대 여성, 뷰티 관심度高
**경쟁 환경**: 올리브영, 처방 등 대형 마켓 Presence

### 2. 전략 제안
**비즈니스 모델**: 직접 판매 + 정기구독
**카테고리**: 스킨케어 40%, 메이크업 30%, 향수 20%, 디바이스 10%

### 3. 실행 가이드
**Phase 1**: 런칭 전 준비 (2개월)
**Phase 2**: 소규모 런칭 (1개월)
**Phase 3**: 본격 운영 (지속적)

### 4. 핵심 지표
- 전환율 목표: 2.5%
- 고객 획득 비용: 15,000원
- 재구매율: 35%
```

## 모니터링

```typescript
interface ExecutionMetrics {
  totalDuration: number;           // 총 실행 시간 (ms)
  skillCount: number;              // 총 스킬 수
  successCount: number;            // 성공 스킬 수
  errorCount: number;              // 실패 스킬 수
  skippedCount: number;            // 스킵 스킬 수
  averageSkillDuration: number;    // 스킬당 평균 실행 시간
  phaseMetrics: PhaseMetric[];     // 단계별 메트릭
}

interface PhaseMetric {
  phaseIndex: number;
  mode: 'sequential' | 'parallel';
  skillCount: number;
  duration: number;
}
```

## 로그 및 디버깅

```typescript
interface ExecutionLog {
  timestamp: Date;
  event: string;
  skillId?: string;
  details: any;
}

function logExecution(log: ExecutionLog) {
  console.log(`[${log.timestamp.toISOString()}] ${log.event}`, log.details);
}
```
