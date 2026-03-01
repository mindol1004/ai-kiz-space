# TDD Workflow Skill (TDD 워크플로우)

## 역할
- Red-Green-Refactor 사이클 가이드
- 테스트 전략 수립 (테스트 피라미드)
- 테스트 더블(Mock/Stub/Fake) 사용법
- 테스트 환경 설정 (Jest/Vitest)

## 파라미터
- `projectType` (string, required): 'web', 'mobile', 'api', 'desktop'
- `framework` (string, optional): 'nextjs', 'react', 'vue', ' express'
- `testingFramework` (string, optional): 'jest', 'vitest', 'mocha', 기본값 'jest'

## 의존성
없음 (독립적)

## 출력
```typescript
{
  workflow: {
    redPhase: { description: '실패하는 테스트 작성', examples: [...] },
    greenPhase: { description: '최소 코드로 테스트 통과', examples: [...] },
    refactorPhase: { description: '코드 개선', guidelines: [...] }
  },
  testStrategy: {
    unitTestRatio: '70%',
    integrationTestRatio: '20%',
    e2eTestRatio: '10%',
    recommendedTools: ['Jest', 'Testing Library', 'MSW']
  },
  codeExamples: {
    unitTest: 'example code',
    integrationTest: 'example code',
    mockExample: 'example code'
  },
  setupGuide: {
    dependencies: [...],
    configFiles: {...},
    scripts: {...}
  }
}
```

## 사용 예시
"Next.js 프로젝트에 TDD 적용하고 싶어" → projectType='web', framework='nextjs'로 자동 추론

## 핵심 개념
1. **Red**: 실패하는 테스트 먼저 작성 (기능 정의)
2. **Green**: 테스트 통과하는 최소한의 코드 작성 (구현)
3. **Refactor**: 중복 제거, 리팩토링 (품질 향상)

## 테스트 피라미드
```
        E2E Tests (5-10%)
          ↑
    Integration Tests (20%)
          ↑
    Unit Tests (70-80%)
```