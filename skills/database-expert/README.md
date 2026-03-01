# 데이터베이스 전문가 스킬들

## 스킬 목록

총 12개의 데이터베이스 전문가 스킬이 구현되어 있습니다.

### 핵심 설계 스킬

#### 1. database-design (데이터베이스 설계)
- **역할**: 요구사항 분석 → 테이블 설계 → 관계 정의 → 제약조건 설정
- **입력**: 비즈니스 요구사항, 엔티티 목록, 관계
- **출력**: 테이블 스키마, 외래 키, 제약조건, DDL 문
- **실행 순서**: 일반적으로 첫 번째로 실행

#### 2. data-modeling (데이터 모델링)
- **역할**: ERD 작성, 엔티티/관계 분석, 정규화 준거
- **입력**: 개념 모델, 비즈니스 프로세스
- **출력**: ERD 다이어그램, 엔티티 속성, 관계 카디널리티
- **실행 순서**: database-design보다 먼저 실행

#### 3. normalization (정규화)
- **역할**: 1NF/2NF/3NF/BCNF 검토, 이상 현상 제거
- **입력**: 테이블 스키마, 샘플 데이터
- **출력**: 정규화 레벨, 분해된 테이블, 개선 방안
- **실행 순서**: database-design 이후 실행

### 성능 최적화 스킬

#### 4. query-optimization (쿼리 최적화)
- **역할**: SQL 쿼리 분석, 실행 계획 검토, 최적화 제안
- **입력**: SQL 쿼리, 테이블 구조, 인덱스 정보
- **출력**: 최적화된 쿼리, 실행 계획 분석, 성능 예측
- **실행 순서**: performance-monitoring 이후에 실행

#### 5. indexing-strategy (인덱싱 전략)
- **역할**: 인덱스 설계, 컬럼 선택, 인덱스 타입 결정
- **입력**: 쿼리 패턴, 테이블 크기, 조회 빈도
- **출력**: 인덱스 생성 DDL, 인덱스 사용 가이드
- **실행 순서**: query-optimization과 함께 또는 이후

#### 6. performance-monitoring (성능 모니터링)
- **역할**: 성능 메트릭 수집, 병목 현상 진단, 모니터링 설정
- **입력**: 현재 DB 상태, 질의량, 하드웨어 정보
- **출력**: 성능 보고서, 병목 지점, 모니터링 대시보드
- **실행 순서**: 대부분의 경우 첫 번째로 실행

### 운영 관리 스킬

#### 7. schema-migration (스키마 마이그레이션)
- **역할**: 스키마 변경 관리, 롤백 계획, 데이터 마이그레이션
- **입력**: 기존 스키마, 변경 요구사항, 대상 DB
- **출력**: 마이그레이션 스크립트, 검증 절차, 롤백 계획
- **실행 순서**: standalone으로 실행

#### 8. security-optimization (보안 최적화)
- **역할**: 접근 제어 설정, 암호화, 감사 로그, 취약점 분석
- **입력**: 현재 권한 설정, 규정 요구사항
- **출력**: 보안 강화 방안, 권한 재설정, 암호화 전략
- **실행 순서**: database-design과 함께 실행

#### 9. backup-recovery (백업 및 복구)
- **역할**: 백업 전략 수립, 복구 절차, RTO/RPO 정의
- **입력**: 데이터 중요도, 운영 시간, 저장 공간
- **출력**: 백업 일정, 복구 절차, 테스트 계획
- **실행 순서**: 운영 환경에서 별도 실행

### 확장성 스킬

#### 10. replication-sharding (복제 및 샤딩)
- **역할**: 고가용성 설계, 읽기 확장, 데이터 분할
- **입력**: 트래픽 패턴, 데이터 크기, 장애 감내성 요구
- **출력**: 복제 설정, 샤딩 키, 장애 조치 계획
- **실행 순서**: 성능 모니터링 후 실행

#### 11. capacity-planning (용량 계획)
- **역할**: 저장 용량 예측, 성능 예측, 비용 분석
- **입력**: 데이터 Growth rate, 쿼리 패턴, SLA
- **출력**: 용량 전망, 하드웨어 요구사항, 비용 예측
- **실행 순서**: 별도 또는 확장 요청 시 실행

#### 12. troubleshooting (문제 해결)
- **역할**: 장애 분석, 로그 확인, 긴급 조치
- **입력**: 에러 메시지, 로그, 시스템 상태
- **출력**: 문제 원인, 해결 방안, 재발 방지 대책
- **실행 순서**: 문제 발생 시 별도 실행

## 스킬 상세 구현

각 스킬은 `index.ts` 파일에 구현되어 있으며, 다음과 같은 구조를 가집니다:

```typescript
interface SkillHandler {
  execute(input: SkillInput): Promise<SkillOutput>;
  getDependencies(): string[];
  getParameters(): ParameterSchema[];
}

class DatabaseDesignSkill implements SkillHandler {
  async execute(input: SkillInput): Promise<SkillOutput> {
    // 스킬 구현
  }

  getDependencies(): string[] {
    return []; // 의존성 있는 스킬 ID 목록
  }

  getParameters(): ParameterSchema[] {
    return []; // 스킬 파라미터 스키마
  }
}
```

## 스킬 실행 가이드

### 독립 실행
```typescript
const skill = getSkillHandler('database-design');
const result = await skill.execute({
  parameters: {
    businessRequirements: "이커머스 플랫폼",
    entities: [...],
    relationships: [...]
  },
  dbType: 'postgresql'
});
```

### 에이전트를 통한 실행
```typescript
const agent = new DatabaseExpertAgent({ dbType: 'postgresql' });
const response = await agent.process("이커머스 DB 설계해줘");
// 자동으로 필요한 스킬들이 선택되고 실행됨
```

## 스킬별 DB 타입 지원

| 스킬 | PostgreSQL | MySQL | MongoDB |
|------|------------|-------|---------|
| database-design | ✅ | ✅ | ✅ |
| data-modeling | ✅ | ✅ | ✅ |
| normalization | ✅ | ✅ | ❌ |
| query-optimization | ✅ | ✅ | ✅ |
| indexing-strategy | ✅ | ✅ | ✅ |
| performance-monitoring | ✅ | ✅ | ✅ |
| schema-migration | ✅ | ✅ | ✅ |
| security-optimization | ✅ | ✅ | ✅ |
| backup-recovery | ✅ | ✅ | ✅ |
| replication-sharding | ✅ | ✅ | ✅ |
| capacity-planning | DB无关 | DB无关 | DB无关 |
| troubleshooting | ✅ | ✅ | ✅ |

## 스킬 개발 가이드

### 새로운 스킬 추가

1. `skills/database-expert/[skill-name]/` 디렉토리 생성
2. `index.ts` 파일에 스킬 구현
3. 스킬 라우터에 매핑 정보 추가

```typescript
// 예시: 새로운 스킬 구현
export class MyNewSkill implements SkillHandler {
  async execute(input: SkillInput): Promise<SkillOutput> {
    // 구현 내용
    return {
      status: 'success',
      result: { /* 결과 */ },
      summary: '스킬 실행 완료'
    };
  }

  getDependencies(): string[] {
    return ['previous-skill'];
  }

  getParameters(): ParameterSchema[] {
    return [
      { name: 'param1', type: 'string', required: true },
      { name: 'param2', type: 'number', required: false }
    ];
  }
}
```

### 테스트
```typescript
import { MyNewSkill } from './skills/database-expert/my-new-skill';

const skill = new MyNewSkill();
const result = await skill.execute({
  parameters: { param1: 'test', param2: 100 },
  dbType: 'postgresql'
});

console.log(result);
```

## 디버깅 및 로깅

각 스킬은 다음과 같은 로그를 출력합니다:

```typescript
console.log(`[Skill:${skillId}] 시작: ${JSON.stringify(input)}`);
console.log(`[Skill:${skillId}] 진행: ${progress}%`);
console.log(`[Skill:${skillId}] 완료: ${JSON.stringify(output)}`);
```

## 버전 관리

스킬 버전은 `package.json`과 별도로 관리:

```typescript
// 각 스킬의 메타데이터
export const skillMetadata = {
  name: 'database-design',
  version: '1.0.0',
  description: '데이터베이스 설계 스킬',
  author: 'Database Expert Team',
  dependencies: ['data-modeling'],
  supportedDatabases: ['postgresql', 'mysql', 'mongodb']
};
```

## 문제 해결

### 스킬 실행 실패
1. 입력 파라미터 검증
2. 의존성 스킬 실행 확인
3. DB 연결 상태 확인
4. 로그 확인

### 성능 문제
1. 스킬 실행 시간 측정
2. 반복 실행 캐싱 적용
3. 병렬 실행 가능 여부 검토

## 참고 자료

- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)
- [MySQL 참조 매뉴얼](https://dev.mysql.com/doc/)
- [MongoDB 매뉴얼](https://www.mongodb.com/docs/)