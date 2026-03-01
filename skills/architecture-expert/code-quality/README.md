# Code Quality Skill (코드 품질 분석)

## 역할
- 코드 스멜 탐지 및 리팩토링 제안
- SOLID 원칙 준수 검증
- 테스트 커버리지 전략 수립
- 정적 분석 도구 설정 가이드

## 파라미터
- `language` (string, required): 'typescript', 'javascript', 'python'
- `framework` (string, optional): 'react', 'vue', 'angular', 'nextjs'
- `currentCoverage` (number, optional): 현재 테스트 커버리지 (%)
- `targetCoverage` (number, optional): 목표 커버리지 (%), 기본값 80

## 의존성
- `tdd-workflow` (선행 권장)
- `architecture-review` (선행 권장)

## 출력
```typescript
{
  qualityAnalysis: {
    overallScore: 72,
    metrics: {
      cyclomaticComplexity: 8.5,
      linesOfCode: 15000,
      testCoverage: 45,
      technicalDebt: '15%',
      codeDuplication: '8%'
    },
    codeSmells: [
      {
        id: 'CS001',
        type: 'LongMethod',
        severity: 'HIGH',
        location: 'src/features/auth/useAuth.ts:45-120',
        description: '메서드 75라인, SRP 위반',
        refactoring: { suggested: 'Extract Method', steps: [...] }
      }
    ]
  },
  refactoringPlan: [...],
  qualityGates: {
    preCommit: [...],
    ci: [...]
  },
  toolingRecommendations: { /* ... */ }
}
```

## 사용 예시
"코드 품질을 분석하고 리팩토링 우선순위를 알려줘"

## 주요 코드 스멜

### 1. God Object
하나의 클래스/모듈이 너무 많은 일을 함

### 2. Long Method
메서드가 50라인을 초과 (SRP 위반)

### 3. Feature Envy
하나의 메서드가 다른 객체의 데이터에 과도하게 의존

### 4. Primitive Obsession
원시 타입(string, number)만 사용, Value Object 부재

### 5. Switch Statements
switch-case 남용 → 다형성 활용

## 리팩토링 패턴

1. **Extract Method**: 긴 메서드를 작게 분리
2. **Extract Value Object**: 원시 타입 → VO
3. **Replace Conditional with Polymorphism**: switch → 다형성
4. **Introduce Parameter Object**: 여러 파라미터 → 객체로 묶기

## 품질 게이트 설정

```json
{
  "preCommit": ["eslint --fix", "prettier --write"],
  "ci": ["jest --coverage", "eslint .", "tsc --noEmit"]
}
```

## 도구 권장사항

- **Lint**: ESLint + TypeScript ESLint
- **Format**: Prettier
- **Type Check**: TypeScript strict
- **Coverage**: Jest --coverage
- **Architecture**: madge (import cycle)
- **Security**: Snyk

## 커버리지 전략

Test Pyramid:
- Unit Tests: 70-80%
- Integration Tests: 20%
- E2E Tests: 5-10%

목표: 80% 이상

## 체크리스트
- [ ] ESLint + Prettier 설정
- [ ] TypeScript strict 모드
- [ ] Jest 커버리지 80%+
- [ ] Pre-commit hooks (Husky)
- [ ] CI quality gate

## 참고 자료

- [Refactoring - Martin Fowler](https://martinfowler.com/books/refactoring.html)
- [Clean Code - Robert C. Martin](https://www.oreilly.com/library/view/clean-code-a/9780136083238/)