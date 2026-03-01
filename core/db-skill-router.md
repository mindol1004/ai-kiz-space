# 데이터베이스 전문가용 스킬 라우터 확장

## 의도 분류 기준

### 데이터베이스 설계
- 키워드: "설계", "구조", "스키마", "테이블", "정의", "ERD"
- 예시: "이커머스 플랫폼 데이터베이스 설계해줘"

### 쿼리 최적화
- 키워드: "쿼리", "성능", "느림", "빠르게", "최적화", "EXPLAIN"
- 예시: "JOIN 쿼리가 너무 느린데 어떻게 최적화하지?"

### 데이터 모델링
- 키워드: "모델링", "ERD", "관계", "엔티티", "속성", "키"
- 예시: "학습 관리 시스템 ERD 그려줘"

### 성능 모니터링
- 키워드: "모니터링", "진단", "분석", "메트릭", "장비", "사양"
- 예시: "데이터베이스 성능을 어떻게 진단하지?"

### 인덱싱 전략
- 키워드: "인덱스", "색인", "검색", "빠른조회", "커버링"
- 예시: "어떤 컬럼에 인덱스를 만들어야 할까?"

### 정규화
- 키워드: "정규화", "중복", "1NF", "2NF", "3NF", "BCNF"
- 예시: "현재 테이블이 정규화가 잘 됐는지 확인해줘"

### 스키마 마이그레이션
- 키워드: "마이그레이션", "이전", "변경", "업그레이드", "변경사항"
- 예시: "MySQL에서 PostgreSQL로 안전하게 마이그레이션하는 방법"

### 문제 해결
- 키워드: "에러", "문제", "오류", "이슈", "해결", "디버깅"
- 예시: "데이터베이스 연결이 자꾸 끊어져요"

### 용량 계획
- 키워드: "용량", "예측", "스케일", "확장", "계획", "저장"
- 예시: "1억 개 상품 데이터 저장 시 용량이 얼마나 필요할까?"

### 보안 최적화
- 키워드: "보안", "권한", "암호화", "인증", "접근제어"
- 예시: "데이터베이스 보안을 어떻게 강화하지?"

### 백업 및 복구
- 키워드: "백업", "복구", "재해", "안정성", "복원", "RTO"
- 예시: "24시간 운영을 위한 백업 전략이 필요해요"

### 복제 및 샤딩
- 키워드: "복제", "리플리카", "샤딩", "분산", "고가용성"
- 예시: "READ 부하를 줄이기 위한 복제 전략이 필요해요"

## 스킬 선택 매트릭스

### 1차 스킬 결정 (주 스킬)
| 의도 | 우선 선택 스킬 |
|------|---------------|
| 데이터베이스 설계 | database-design, data-modeling |
| 쿼리 최적화 | query-optimization, indexing-strategy |
| 데이터 모델링 | data-modeling, normalization |
| 성능 모니터링 | performance-monitoring, query-optimization |
| 인덱싱 전략 | indexing-strategy, query-optimization |
| 정규화 | normalization, data-modeling |
| 스키마 마이그레이션 | schema-migration, database-design |
| 문제 해결 | troubleshooting, performance-monitoring |
| 용량 계획 | capacity-planning, performance-monitoring |
| 보안 최적화 | security-optimization, database-design |
| 백업 복구 | backup-recovery, performance-monitoring |
| 복제 샤딩 | replication-sharding, performance-monitoring |

### 2차 스킬 결정 (보조 스킬)
| 주 스킬 | 자동 추가 보조 스킬 |
|--------|------------------|
| database-design | normalization, indexing-strategy |
| query-optimization | performance-monitoring |
| data-modeling | normalization |
| performance-monitoring | troubleshooting |
| indexing-strategy | query-optimization |
| schema-migration | backup-recovery |

## 실행 순서 결정 규칙

### 기본 순서
1. 분석 스킬 (현황 파악)
2. 설계 스킬 (해결책 설계)
3. 최적화 스킬 (성능 개선)
4. 운영 스킬 (관리 및 유지)

### 의도별 우선순위
| 의도 | 실행 순서 |
|------|----------|
| 신규 설계 | data-modeling → database-design → normalization → indexing-strategy |
| 성능 문제 | performance-monitoring → query-optimization → indexing-strategy |
| 문제 해결 | troubleshooting → performance-monitoring → query-optimization |
| 마이그레이션 | schema-migration → database-design → backup-recovery |
| 보안 강화 | security-optimization → database-design |
| 확장 준비 | capacity-planning → replication-sharding → performance-monitoring |

## 프롬프트 분석 예시

### 예시 1: 신규 이커머스 DB 설계
```
입력: "이커머스 플랫폼을 위한 데이터베이스 설계가 필요해요"

분석:
- 의도: 데이터베이스 설계
- 키워드: 이커머스, 플랫폼, 설계
- DB 타입 추정: (없음, 기본값 사용)

선택된 스킬:
1. data-modeling (우선순위: 1)
   이유: ERD 작성 및 엔티티 관계 정의 필요
2. database-design (우선순위: 2)
   이유: 실제 테이블 스키마 설계 필요
3. normalization (우선순위: 3)
   이유: 정규화를 통한 데이터 중복 최소화
4. indexing-strategy (우선순위: 4)
   이유: 조회 성능을 위한 인덱스 설계 필요
```

### 예시 2: 쿼리 성능 문제
```
입력: "상품 조회 쿼리가 너무 느려요. 100만 개 데이터 있어요."

분석:
- 의도: 쿼리 최적화
- 키워드: 느림, 쿼리, 100만 개
- 데이터 크기: 100만 개

선택된 스킬:
1. performance-monitoring (우선순위: 1)
   이유: 현재 성능 상태 진단 필요
2. query-optimization (우선순위: 2)
   이유: 쿼리 자체 최적화 필요
3. indexing-strategy (우선순위: 3)
   이유: 적절한 인덱스 추가 필요
```

### 예시 3: DB 마이그레이션
```
입력: "MySQL 5.7에서 PostgreSQL 14로 마이그레이션해야 해요"

분석:
- 의도: 스키마 마이그레이션
- 키워드: 마이그레이션, MySQL, PostgreSQL
- 소스 DB: MySQL 5.7
- 타겟 DB: PostgreSQL 14

선택된 스킬:
1. schema-migration (우선순위: 1)
   이유: 스키마 변환 및 데이터 이전
2. database-design (우선순위: 2)
   이유: DB 타입 차이에 따른 설계 조정
3. backup-recovery (우선순위: 3)
   이유: 안전한 마이그레이션을 위한 백업 전략
```

## DB 타입별 스킬 조정

### PostgreSQL 특화
- `indexing-strategy`: BRIN, GIN, GiST 인덱스 고려
- `performance-monitoring`: pg_stat_statements 활용
- `query-optimization`: CTE, Window 함수 활용 최적화

### MySQL 특화
- `indexing-strategy`: covering index, index condition pushdown
- `performance-monitoring`: slow query log 분석
- `query-optimization`: optimizer hint 활용

### MongoDB 특화
- `database-design`: document structure 설계
- `indexing-strategy`: compound index, text search index
- `performance-monitoring`: explain plan, profiling

## 컨텍스트 활용

### 이전 세션 컨텍스트
이전 대화 내용이 있으면:
1. 이미 분석된 모델 재사용
2. 이전 권고사항 추적
3. 연속적인 개선 작업 지원

예시:
- Session 1: 데이터 모델링 완료
- Session 2: "이 모델에 인덱싱 전략도 추가해줘" → data-modeling 결과 활용

### DB 타입 컨텍스트
DB 타입에 따라:
1. 해당 DB의 특성 반영
2. 문법 차이 고려
3. 최적화 기법 적용