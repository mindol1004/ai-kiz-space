# 스킬 레지스트리 구현 가이드

## 개요

스킬 레지스트리는 모든 스킬을 중앙에서 등록, 조회, 관리하는 싱글턴 저장소입니다.

## 핵심 기능

1. **스킬 등록**: `register(skillId, handler)`
2. **스킬 조회**: `get(skillId)` 또는 `has(skillId)`
3. **의존성 관리**: `setDependencies(skillId, deps)`, `getDependencies(skillId)`
4. **스킬 목록**: `listSkills()`, `size`
5. **의존성 그래프**: `buildDependencyGraph(skillIds)`

## 타입 정의

```typescript
import type { SkillHandler } from '@/types/skill';

export class SkillRegistry {
  private skills: Map<string, SkillHandler> = new Map();
  private dependencies: Map<string, string[]> = new Map();

  // 메서드들...
}
```

## 1. 스킬 등록

### 기본 등록

```typescript
const registry = new SkillRegistry();

registry.register('target-analysis', new TargetAnalysisSkill());
registry.register('competitor-analysis', new CompetitorAnalysisSkill());

console.log(registry.size); // 2
console.log(registry.listSkills()); // ['target-analysis', 'competitor-analysis']
```

### 중복 등록

```typescript
registry.register('target-analysis', new TargetAnalysisSkill());
// 경고: 스킬 'target-analysis'가 이미 등록되어 있습니다. 덮어쓰겠습니다.
```

## 2. 의존성 관리

### 의존성 설정

```typescript
// target-analysis는 독립적
registry.setDependencies('target-analysis', []);

// competitor-analysis는 target-analysis 이후 실행
registry.setDependencies('competitor-analysis', ['target-analysis']);

// business-model은 두 스킬 이후 실행
registry.setDependencies('business-model', ['target-analysis', 'competitor-analysis']);
```

### 의존성 조회

```typescript
registry.getDependencies('target-analysis');      // []
registry.getDependencies('competitor-analysis'); // ['target-analysis']
registry.getDependencies('business-model');      // ['target-analysis', 'competitor-analysis']
```

## 3. 의존성 그래프 구축

### 메서드

```typescript
buildDependencyGraph(skillIds: string[]): Map<string, string[]>
```

### 예시

```typescript
const skillIds = ['target-analysis', 'competitor-analysis', 'business-model'];

const graph = registry.buildDependencyGraph(skillIds);
/*
Graph {
  'target-analysis' => [],
  'competitor-analysis' => ['target-analysis'],
  'business-model' => ['target-analysis', 'competitor-analysis']
}
*/
```

### 필터링 동작

- 입력 skillIds 목록에 없는 의존성은 자동으로 제외됨
- 의존성이 registered 스킬 IDs 목록에 있는지 확인

```typescript
registry.setDependencies('business-model', ['target-analysis', 'non-existent-skill']);
// non-existent-skill은 그래프에서 제외됨
```

## 4. SkillHandler 인터페이스

모든 스킬은 이 인터페이스를 구현해야 합니다:

```typescript
export interface SkillHandler {
  execute(input: SkillInput): Promise<SkillOutput>;
  getDependencies(): string[];
  getParameters(): ParameterSchema[];
}
```

### 구현 예시

```typescript
import type { SkillHandler, SkillInput, SkillOutput } from '@/types/skill';

export class TargetAnalysisSkill implements SkillHandler {
  async execute(input: SkillInput): Promise<SkillOutput> {
    const { parameters } = input;

    // 로직 실행
    const result = { /* ... */ };

    return {
      status: 'success',
      result,
      summary: '타겟 분석 완료'
    };
  }

  getDependencies(): string[] {
    return []; // 독립적
  }

  getParameters(): ParameterSchema[] {
    return [
      { name: 'targetAge', type: 'string', required: false },
      { name: 'targetGender', type: 'string', required: false, default: '전체' }
    ];
  }
}
```

### getParameters() 활용

```typescript
// 스킬 등록 시 메타데이터 수집
const metadata = registry.getSkillsMetadata();
/*
[
  {
    id: 'target-analysis',
    parameters: [
      { name: 'targetAge', type: 'string', required: false },
      { name: 'targetGender', type: 'string', required: false, default: '전체' }
    ],
    dependencies: []
  }
]
*/
```

현재 `getSkillsMetadata()`는 dependencies 정보도 별도로 읽어옵니다.

## 5. 초기화 패턴

### ShoppingPlannerAgent.initialize()

```typescript
static initialize(): SkillRegistry {
  const registry = new SkillRegistry();

  // 모든 스킬 import 및 등록
  const { TargetAnalysisSkill } = require('./skills/shopping-planner/target-analysis');
  const { CompetitorAnalysisSkill } = require('./skills/shopping-planner/competitor-analysis');
  // ... 다른 스킬들

  // 등록
  registry.register('target-analysis', new TargetAnalysisSkill());
  registry.register('competitor-analysis', new CompetitorAnalysisSkill());

  // 의존성 설정 (한 번에)
  registry.setDependencies('target-analysis', []);
  registry.setDependencies('competitor-analysis', ['target-analysis']);
  registry.setDependencies('business-model', ['target-analysis', 'competitor-analysis']);
  // ...

  return registry;
}
```

### 싱글턴 패턴

```typescript
class ShoppingPlannerAgent {
  private static sharedRegistry: SkillRegistry | null = null;

  static getRegistry(): SkillRegistry {
    if (!this.sharedRegistry) {
      this.sharedRegistry = this.initialize();
    }
    return this.sharedRegistry;
  }
}
```

## 6. 디버깅 도구

### 전체 상태 출력

```typescript
function debugRegistry(registry: SkillRegistry): void {
  console.log('=== Registered Skills ===');
  registry.listSkills().forEach(skillId => {
    const deps = registry.getDependencies(skillId);
    console.log(`- ${skillId} (deps: ${deps.join(', ') || 'none'})`);
  });
  console.log(`Total: ${registry.size} skills`);
}

// 사용
debugRegistry(registry);
```

### 의존성 그래프 시각화

```typescript
function printDependencyGraph(graph: Map<string, string[]>): void {
  console.log('=== Dependency Graph ===');
  for (const [node, deps] of graph.entries()) {
    const depList = deps.length > 0 ? deps.join(' → ') : 'root';
    console.log(`${node} ← ${depList}`);
  }
}
```

## 7. 테스트

### 단위 테스트

```typescript
describe('SkillRegistry', () => {
  let registry: SkillRegistry;

  beforeEach(() => {
    registry = new SkillRegistry();
  });

  test('스킬 등록 및 조회', () => {
    const skill = new MockSkill();
    registry.register('test-skill', skill);

    expect(registry.has('test-skill')).toBe(true);
    expect(registry.get('test-skill')).toBe(skill);
    expect(registry.size).toBe(1);
  });

  test('스킬 목록', () => {
    registry.register('skill-a', new MockSkillA());
    registry.register('skill-b', new MockSkillB());

    const skills = registry.listSkills();
    expect(skills).toContain('skill-a');
    expect(skills).toContain('skill-b');
    expect(skills.length).toBe(2);
  });

  test('의존성 설정 및 조회', () => {
    registry.setDependencies('skill-b', ['skill-a']);

    expect(registry.getDependencies('skill-b')).toEqual(['skill-a']);
    expect(registry.getDependencies('skill-a')).toEqual([]);
  });

  test('의존성 그래프 구축', () => {
    registry.register('skill-a', new MockSkillA());
    registry.register('skill-b', new MockSkillB());
    registry.register('skill-c', new MockSkillC());

    registry.setDependencies('skill-b', ['skill-a']);
    registry.setDependencies('skill-c', ['skill-b']);

    const graph = registry.buildDependencyGraph(['skill-a', 'skill-b', 'skill-c']);

    expect(graph.get('skill-a')).toEqual([]);
    expect(graph.get('skill-b')).toEqual(['skill-a']);
    expect(graph.get('skill-c')).toEqual(['skill-b']);
  });

  test('등록되지 않은 스킬 조회', () => {
    expect(registry.get('non-existent')).toBeUndefined();
    expect(registry.has('non-existent')).toBe(false);
  });

  test('의존성 제거', () => {
    registry.unregister('skill-a');
    expect(registry.has('skill-a')).toBe(false);
  });

  test('전체 초기화', () => {
    registry.register('skill-a', new MockSkillA());
    registry.register('skill-b', new MockSkillB());

    registry.clear();

    expect(registry.size).toBe(0);
    expect(registry.listSkills()).toEqual([]);
  });
});
```

## 8. 확장 기능

### 스킬 메타데이터 캐싱

```typescript
private metadataCache: Map<string, any> = new Map();

getSkillsMetadata(): any[] {
  if (this.metadataCache.size === this.skills.size) {
    return Array.from(this.metadataCache.values());
  }

  const metadata: any[] = [];
  for (const [skillId, handler] of this.skills) {
    const meta = {
      id: skillId,
      parameters: handler.getParameters(),
      dependencies: this.getDependencies(skillId)
    };
    this.metadataCache.set(skillId, meta);
    metadata.push(meta);
  }

  return metadata;
}
```

### 스킬 상태 모니터링

```typescript
interface SkillStats {
  id: string;
  className: string;
  executionCount: number;
  lastExecuted: Date | null;
  avgDuration: number;
  successRate: number;
}

private stats: Map<string, SkillStats> = new Map();

incrementExecutionCount(skillId: string, duration: number, status: string): void {
  const existing = this.stats.get(skillId) || {
    id: skillId,
    className: this.skills.get(skillId)?.constructor.name || 'Unknown',
    executionCount: 0,
    lastExecuted: null,
    avgDuration: 0,
    successRate: 0
  };

  existing.executionCount++;
  existing.lastExecuted = new Date();
  existing.avgDuration = (existing.avgDuration * (existing.executionCount - 1) + duration) / existing.executionCount;

  this.stats.set(skillId, existing);
}

getStats(): SkillStats[] {
  return Array.from(this.stats.values());
}
```

### 스킬 버전 관리

```typescript
interface VersionedSkill {
  handler: SkillHandler;
  version: string;
  deprecated: boolean;
  replacedBy?: string;
}

private versionedSkills: Map<string, VersionedSkill> = new Map();

registerVersioned(skillId: string, handler: SkillHandler, version: string): void {
  this.versionedSkills.set(skillId, {
    handler,
    version,
    deprecated: false
  });
}

getVersion(skillId: string): string | undefined {
  return this.versionedSkills.get(skillId)?.version;
}
```

## 9. 실패 시나리오

### 의존성 없는 스킬 요청

```typescript
registry.getDependencies('non-registered-skill'); // []
// get()은 undefined 반환
const handler = registry.get('non-registered-skill'); // undefined
// 실행 시 에러 발생
```

### 순환 의존성

```typescript
registry.setDependencies('A', ['C']);
registry.setDependencies('B', ['A']);
registry.setDependencies('C', ['B']); // C → A → B → C (순환)

const graph = registry.buildDependencyGraph(['A', 'B', 'C']);
// createExecutionPlan()에서 순환 감지 에러 발생
```

### 해결 방법

- 스킬 등록 전에 의존성 순환 검사
- `buildDependencyGraph()`에서 재귀 검출
- 명확한 문서화: 각 스킬 의존성 다이어그램 제공

## 10. 모범 사례

1. **의존성 최소화**: 불필요한 의존성 추가 금지
2. **단일 책임**: 한 스킬은 하나의 기능만
3. **의존성 명시**: getDependencies() 정확히 구현
4. **에러 격리**: 스킬 내부 에러가 registry에 영향 안 주도록
5. **버전 관리**: 스킬 업데이트 시 변경사항 기록

## 11. 확장: 정적 분석

```typescript
// 의존성 사이클 검사 (DFS)
private hasCycle(graph: Map<string, string[]>): boolean {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(node: string): boolean {
    if (recursionStack.has(node)) return true;
    if (visited.has(node)) return false;

    visited.add(node);
    recursionStack.add(node);

    const dependencies = graph.get(node) || [];
    for (const dep of dependencies) {
      if (dfs(dep)) return true;
    }

    recursionStack.delete(node);
    return false;
  }

  for (const node of graph.keys()) {
    if (dfs(node)) return true;
  }

  return false;
}

// buildDependencyGraph()에서 호출 가능
if (this.hasCycle(graph)) {
  throw new Error('순환 의존성 감지');
}
```