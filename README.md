# 🤖 AI 에이전트 기반 개발 가이드 시스템

> 소프트웨어 개발 시 TDD, DDD, FSD 방법론을 AI가 안내하는 지능형 가이드 시스템

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 목차

- [개요](#개요)
- [주요 에이전트](#주요-에이전트)
- [빠른 시작](#빠른-시작)
- [파일 구조](#파일-구조)
- [아키텍처](#아키텍처)
- [확장 가이드](#확장-가이드)
- [기여하기](#기여하기)

## 개요

이 프로젝트는 소프트웨어 개발 과정에서 **AI 에이전트**가 TDD(테스트 주도 개발), DDD(도메인 주도 설계), FSD(Feature-Sliced Design) 방법론을 적용하여 아키텍처 설계와 코드 품질을 가이드하는 시스템입니다.

### 주요 특징

- 🎯 **도메인 전문가**: 각 전문분야별 AI 에이전트 (쇼핑몰 기획, DB 설계, 아키텍처 등)
- 🧩 **스킬 기반**: 각 에이전트는 여러 스킬로 구성, 의존성 관리 자동화
- 📊 **의도 분석**: 사용자 프롬프트를 분석하여 필요한 스킬 자동 선택
- 🔄 **의존성 그래프**: 스킬 간 의존성을 고려한 최적 실행 순서 결정
- 📝 **문서화**: ADR, API 문서, 아키텍처 다이어그램 자동 생성
- 🚀 **확장성**: 새로운 에이전트/스킬 쉽게 추가 가능

## 주요 에이전트

### 1. 🛒 쇼핑몰 기획 전문가 (Shopping Planner)

이커머스/쇼핑몰 프로젝트의 처음부터 끝까지 기획을 지원합니다.

**포함 스킬**:
- `target-analysis`: 타겟 고객 페르소나 생성, 시장 세분화
- `competitor-analysis`: 경쟁사 분석, SWOT, Positioning
- `business-model`: 비즈니스 모델 캔버스, 수익 구조
- `category-design`: 카테고리 구조, 내비게이션 설계
- `customer-analytics`: 고객 행동, LTV 분석
- `journey-design`: 고객 여정 맵핑,触点 최적화
- `conversion-optimization`: 전환율 개선 전략
- `pricing-strategy`: 가격 전략, 할인 정책

**사용 예시**:
```bash
curl -X POST http://localhost:3000/api/planner \
  -H "Content-Type: application/json" \
  -d '{"prompt": "30대 여성 타겟 뷰티 쇼핑몰 기획해줘"}'
```

### 2. 🗄️ 데이터베이스 전문가 (Database Expert)

데이터베이스 설계, 성능 최적화, 모델링을 지원합니다.

**포함 스킬**:
- `database-design`: 테이블 스키마 설계, 관계 정의
- `data-modeling`: ERD 작성, 엔티티/관계 분석
- `query-optimization`: SQL 쿼리 최적화, 실행 계획 분석
- `performance-monitoring`: 성능 진단, 병목 현상 식별
- `indexing-strategy`: 인덱스 설계 및 권고
- `normalization`: 정규화 검토 (1NF/2NF/3NF)
- `schema-migration`: 스키마 변경 관리
- `security-optimization`: 보안 최적화, 권한 관리

**지원 DB**: PostgreSQL, MySQL, MongoDB

**사용 예시**:
```bash
curl -X POST http://localhost:3000/api/database-expert \
  -H "Content-Type: application/json" \
  -d '{"prompt": "이커머스 플랫폼 DB 설계해줘", "dbType": "postgresql"}'
```

### 3. 🏗️ 아키텍처 전문가 (Architecture Expert) ✨

TDD, DDD, FSD 방법론을 적용한 아키텍처 설계를 지원합니다.

**포함 스킬**:
- `tdd-workflow`: Red-Green-Refactor 사이클, 테스트 피라미드, 테스트 환경 설정
- `domain-modeling`: DDD 엔티티/밸류/애그리거트, 리포지토리 패턴, 도메인 이벤트
- `fsd-structuring`: Feature-Sliced Design 디렉토리 구조, 레이어 규칙, Public API 설계
- `architecture-review`: SOLID 원칙 검증, 코드 스멜 탐지, 리팩토링 우선순위
- `code-quality`: 코드 품질 분석, 테스트 커버리지 전략, 품질 게이트 설정
- `documentation`: ADR 작성, API 문서 자동화, Mermaid 다이어그램

**사용 예시**:
```bash
curl -X POST http://localhost:3000/api/architecture-expert \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Next.js 프로젝트를 FSD로 구조화하고 TDD 적용해줘"}'
```

## 빠른 시작

### 1. 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

서버가 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

### 3. API 호출

```bash
# 쇼핑몰 기획 전문가
curl -X POST http://localhost:3000/api/planner \
  -H "Content-Type: application/json" \
  -d '{"prompt": "보험 SaaS 플랫폼 기획해줘"}'

# 데이터베이스 전문가
curl -X POST http://localhost:3000/api/database-expert \
  -H "Content-Type: application/json" \
  -d '{"prompt": "게임 가상화폐 DB 설계해줘"}'
```

## 파일 구조

```
/workspace/ai-kiz-space/
├── agents/                    # 에이전트 정의 문서 (.md)
│   ├── shopping-planner.md
│   ├── database-expert.md
│   └── architecture-expert.md
├── core/                      # 코어 컴포넌트 구현 가이드
│   ├── main-agent.md         # 메인 에이전트 문서
│   ├── skill-router.md       # 스킬 라우터 구현 가이드
│   ├── skill-executor.md     # 스킬 실행기 구현 가이드
│   ├── skill-registry.md     # 스킬 레지스트리 구현 가이드
│   ├── db-skill-router.md    # DB 전문가 라우터 매핑
│   └── architecture-skill-router.md  # 아키텍처 전문가 라우터 매핑
├── skills/                    # 스킬 상세 문서
│   ├── shopping-planner/     # 8개 스킬 문서
│   ├── database-expert/      # 4개 스킬 문서
│   └── architecture-expert/  # 6개 스킬 문서
├── types/
│   └── skill.ts              # SkillHandler 인터페이스
├── app/
│   ├── api/
│   │   ├── planner/route.ts  # 쇼핑몰 전문가 API
│   │   └── database-expert/route.ts
│   ├── layout.tsx
│   └── page.tsx
├── package.json
├── tsconfig.json
├── eslint.config.mjs
└── README.md
```

## 아키텍처

### 메인 에이전트 흐름

```
사용자 프롬프트
    ↓
[1] Skill Router (의도 분석)
    ├── 프롬프트 키워드 추출
    ├── 에이전트 타입 식별
    └── 관련 스킬 매핑
    ↓
[2] Skill Executor (실행 계획 수립)
    ├── 의존성 그래프 구축
    ├── Topological sort (실행 순서 결정)
    └── Phase별 실행 계획 (순차/병렬)
    ↓
[3] 스킬 실행
    ├── Phase 1: 독립적 스킬들 (병렬 가능)
    ├── Phase 2: 의존성 있는 스킬들 (순차)
    └── ...
    ↓
[4] 결과 통합
    ├── 모든 스킬 결과 수집
    ├── 에러 처리 (부분 성공 허용)
    └── Human-readable summary 생성
    ↓
응답 반환
```

### 의존성 그래프 예시 (쇼핑몰 기획)

```
target-analysis (의존성 없음)
    ↓
competitor-analysis (target-analysis 필요)
    ↓
business-model (target-analysis, competitor-analysis 필요)
    ↓
category-design (business-model 필요)  → 병렬 가능
pricing-strategy (competitor-analysis 필요)
    ↓
customer-analytics (target-analysis 필요)
    ↓
journey-design (customer-analytics 필요)
    ↓
conversion-optimization (journey-design 필요)
```

## 확장 가이드

### 새로운 에이전트 추가하기

1. **에이전트 문서 작성**: `agents/my-agent.md` 작성
2. **스킬 디렉토리**: `skills/my-agent/{skill-a,skill-b}/` 생성
3. **라우터 매핑 문서**: `core/my-agent-skill-router.md` 작성 (의도 분류, 스킬 매핑)
4. **SkillRouter 확장**: `core/skill-router.ts`에 `analyzeMyAgentPrompt()`, `getMyAgentSkillMap()` 추가
5. **Main Agent 구현**: `core/my-agent.ts` 생성
6. **API 엔드포인트**: `app/api/my-agent/route.ts` 생성
7. **테스트**: 단위/통합 테스트 작성

상세: [스킬 라우터 구현 가이드](./core/skill-router.md#에이전트-확장-가이드)

### 새로운 스킬 추가하기

1. **스킬 디렉토리 생성**:
```bash
mkdir -p skills/shopping-planner/my-skill/
```

2. **index.ts 구현**:
```typescript
import type { SkillHandler, SkillInput, SkillOutput } from '@/types/skill';

export class MySkill implements SkillHandler {
  async execute(input: SkillInput): Promise<SkillOutput> {
    // 스킬 로직
    return { status: 'success', result: {}, summary: '' };
  }

  getDependencies(): string[] {
    return ['previous-skill']; // 의존성 있으면 작성
  }

  getParameters(): ParameterSchema[] {
    return [{ name: 'param', type: 'string', required: true }];
  }
}
```

3. **README.md 작성**: 사용법, 파라미터, 예제 작성

4. **레지스트리 등록** (Main Agent 초기화 시):
```typescript
registry.register('my-skill', new MySkill());
registry.setDependencies('my-skill', ['previous-skill']);
```

5. **라우터 매핑 추가**:
```typescript
private getShoppingSkillMap(): Record<string, string[]> {
  const map = { /* ... */ };
  map['특정의도'] = ['my-skill', ...];
  return map;
}
```

## 개발 체크리스트

### Before
- [ ] 에이전트 역할 명확히 정의
- [ ] 필요한 스킬 리스트업
- [ ] 의존성 그래프 설계
- [ ] API 명세 작성

### During
- [ ] SkillHandler 인터페이스 구현
- [ ] 의존성 설정 (`registry.setDependencies`)
- [ ] 라우터 매핑 추가
- [ ] 에러 처리 구현
- [ ] 로깅 추가 (console.log)

### After
- [ ] 단위 테스트 작성 (각 스킬)
- [ ] 통합 테스트 작성 (에이전트 전체)
- [ ] 문서 업데이트 (README, 스킬 README)
- [ ] 성능 테스트 (큰 프롬프트, 다중 스킬)
- [ ] 모니터링 설정 (에러율, 실행 시간)

## 품질 기준

- **TypeScript**: strict mode 필수
- **테스트 커버리지**: 80% 이상
- **린트**: ESLint 0 에러
- **타입 체크**: `tsc --noEmit` 통과
- **의존성 사이클**: 없음 (madge 검사)
- **코드 품질**: 복잡도 10 이하, 메서드 50라인 이하

## 스크립트

```bash
npm run dev          # 개발 서버 (http://localhost:3000)
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버
npm run lint         # ESLint 실행
npm run typecheck    # TypeScript 타입 검사
```

## 환경 변수

```env
# .env.local
AGENT_MAX_EXECUTION_TIME=120000  # ms
AGENT_ENABLE_CACHING=true
AGENT_VERBOSE_LOGGING=true
```

## 문제 해결

### Q: 스킬이 실행되지 않아요
A: `SkillRegistry`에 정상 등록되었는지 확인하세요. `registry.has(skillId)`로 조회 가능.

### Q: 의존성 사이클 에러
A: `createExecutionPlan()`에서 순환 의존성 감지. 스킬 의존성 그래프를 검토하고 사이클을 제거하세요.

### Q: 결과가 빈 객체에요
A: 프롬프트 의도 분석이 정확한지 확인하세요. `architecture-expert`와 같은 정확한 에이전트 타입을 포함하세요.

### Q: 성능이 느려요
A: 의존성 그래프에서 병렬화 가능한 스킬들을 확인하세요. 의존성이 없는 스킬들은 자동 병렬 실행됩니다.

## 참고 자료

### 에이전트 설계
- [LangChain Agents](https://python.langchain.com/docs/modules/agents/)
- [ReAct Pattern](https://react-lm.github.io/)
- [AutoGPT](https://github.com/Significant-Gravitas/AutoGPT)

### 아키텍처 방법론
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Domain-Driven Design - Eric Evans](https://www.domainlanguage.com/ddd/)
- [Clean Architecture - Robert C. Martin](https://www.oreilly.com/library/view/clean-architecture-a/9780134494272/)
- [TDD by Example - Kent Beck](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

### 도구
- [Mermaid.js](https://mermaid.js.org/) - 다이어그램
- [OpenAPI](https://spec.openapis.org/oas/v3.1.0) - API 문서
- [Jest](https://jestjs.io/) - 테스트 프레임워크

## 라이선스

MIT © 2024 AI Kiz Space

---

**⚠️ 중요**: 이 프로젝트는 **문서/가이드 시스템**입니다. 실제 TypeScript 실행 코드는 제공되지 않으며, 각 에이전트의 구현 가이드를 참고하여 사용자가 직접 구현해야 합니다.