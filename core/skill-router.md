# 스킬 라우터 (Skill Router)

## 역할

사용자 프롬프트를 분석하여 **관련된 스킬을 자동 선택**하고 **실행 순서를 결정**합니다. LLM의 추론 능력을 활용하여 프롬프트의 진짜 의도를 파악하고 최적의 스킬 조합을 구성합니다.

## 입력 형식

```typescript
interface RouterInput {
  userPrompt: string;       // 사용자 프롬프트
  context?: {              // 선택적 컨텍스트
    projectType?: string;
    previousSession?: any;
    userProfile?: any;
  };
}
```

## 출력 형식

```typescript
interface RouterOutput {
  selectedSkills: {        // 선택된 스킬 목록
    skillId: string;       // 스킬 ID
    priority: number;      // 실행 우선순위 (낮을수록 먼저)
    reason: string;        // 선택 이유
    parameters?: any;      // 스킬 파라미터 (추론된 것)
  }[];
  intent: string;          // 프롬프트 의도 요약
  suggestedApproach: string; // 권장 접근 방식
}
```

## 라우팅 로직

### 1단계: 프롬프트 의도 분류

```markdown
## 의도 분류 기준

### 전략/기획 (Strategy)
- 키워드: "기획", "전략", "타겟", "경쟁", "비즈니스", "모델", "로드맵", "성장"
- 예시: "30대 여성 타겟 뷰티 쇼핑몰 기획해줘"

### 상품기획 (Product)
- 키워드: "상품", "카테고리", "가격", "트렌드", "시즌", "포트폴리오", "재고"
- 예시: "뷰티 카테고리 구조와 가격 전략建议해줘"

### 고객경험 (Experience)
- 키워드: "고객", "여정", "전환율", "리텐션", "개인화", "추천", "리뷰"
- 예시: "고객 전환율 높이는 방법 알려줘"

### 마케팅 (Marketing)
- 키워드: "마케팅", "프로모션", "바이럴", "광고", "브랜드", "인플루언서"
- 예시: "신규 쇼핑몰 런칭 마케팅 전략 세워줘"

### 운영 (Operation)
- 키워드: "운영", "주문", "배송", "정산", "공급망", "품질", "반품"
- 예시: "주문배송 프로세스 최적화 방안 알려줘"

### 데이터분석 (Analytics)
- 키워드: "분석", "KPI", "매출", "성과", "대시보드", "指标"
- 예시: "쇼핑몰 KPI 대시보드 구성 알려줘"
```

### 2단계: 스킬 매핑

```markdown
## 스킬 선택 매트릭스

### 1차 스킬 결정 (주 스킬)
| 의도 | 우선 선택 스킬 |
|------|---------------|
| 전략/기획 | target-analysis, competitor-analysis, business-model, growth-strategy |
| 상품기획 | category-design, portfolio-strategy, pricing-strategy, seasonal-trend |
| 고객경험 | journey-design, conversion-optimization, retention-strategy, personalization |
| 마케팅 | channel-strategy, promotion-planning, viral-marketing, brand-identity |
| 운영 | order-process, settlement-management, supply-chain, quality-control |
| 데이터분석 | kpi-dashboard, sales-analysis, customer-analytics, performance-monitoring |

### 2차 스킬 결정 (보조 스킬)
| 주 스킬 | 자동 추가 보조 스킬 |
|--------|------------------|
| target-analysis | customer-analytics |
| competitor-analysis | business-model |
| portfolio-strategy | kpi-dashboard |
| journey-design | conversion-optimization |
| channel-strategy | promotion-planning |
| order-process | settlement-management |
```

### 3단계: 실행 순서 결정

```markdown
## 실행 순서 결정 규칙

### 기본 순서
1. 분석 스킬 (데이터 수집/분석)
2. 전략 스킬 (방향 수립)
3. 설계 스킬 (구체화)
4. 실행 스킬 (마감/제안)

### 의도별 우선순위
| 의도 | 실행 순서 |
|------|----------|
| 신규 기획 | 분석 → 전략 → 설계 |
| 문제 해결 | 분석 → 해결책 |
| 최적화 | 현황분석 → 최적화 → 검증 |
| 전략 수립 | 분석 → 전략 → 로드맵 |
| 종합 요청 | 전 스킬 순차 실행 |
```

## 사용 예시

### 예시 1: 신규 쇼핑몰 기획
```
입력: "30대 여성 타겟으로 뷰티 쇼핑몰을 처음부터 기획하고 싶어요"

출력:
{
  intent: "신규 뷰티 쇼핑몰 종합 기획",
  selectedSkills: [
    { skillId: "target-analysis", priority: 1, reason: "30대 여성 타겟 상세 분석 필요" },
    { skillId: "competitor-analysis", priority: 2, reason: "뷰티 마켓 경쟁사 파악" },
    { skillId: "business-model", priority: 3, reason: "비즈니스 모델 선정" },
    { skillId: "category-design", priority: 4, reason: "카테고리 구조 설계" },
    { skillId: "portfolio-strategy", priority: 5, reason: "상품 포트폴리오 구성" },
    { skillId: "pricing-strategy", priority: 6, reason: "가격 전략 수립" },
    { skillId: "growth-strategy", priority: 7, reason: "성장 로드맵 작성" }
  ]
}
```

### 예시 2: 전환율 최적화
```
입력: "우리 쇼핑몰 전환율이 너무 낮아요. 높이는 방법이 있을까요?"

출력:
{
  intent: "전환율 최적화 솔루션",
  selectedSkills: [
    { skillId: "customer-analytics", priority: 1, reason: "현재 고객 이탈 지점 분석" },
    { skillId: "journey-design", priority: 2, reason: "사용자 여정 최적화" },
    { skillId: "conversion-optimization", priority: 3, reason: "전환율 개선 전략" },
    { skillId: "personalization", priority: 4, reason: "개인화 추천 도입" }
  ]
}
```

### 예시 3: 마케팅 전략
```
입력: "신규 쇼핑몰 런칭 마케팅 어떻게 해야 할까요?"

출력:
{
  intent: "신규 쇼핑몰 런칭 마케팅 전략",
  selectedSkills: [
    { skillId: "channel-strategy", priority: 1, reason: "타겟 채널 선정" },
    { skillId: "brand-identity", priority: 2, reason: "브랜드 아이덴티티 구축" },
    { skillId: "promotion-planning", priority: 3, reason: "런칭 프로모션 기획" },
    { skillId: "viral-marketing", priority: 4, reason: "바이럴 전략" }
  ]
}
```

## 프롬프트 템플릿

### 기본 분석 프롬프트
```
다음 사용자 프롬프트를 분석하여 관련 스킬을 선택해줘.

사용자 프롬프트: {user_prompt}

사용 가능한 스킬 목록:
{skill_list}

출력 형식:
- 의도 분류: [분류]
- 선택된 스킬: [스킬ID 목록]
- 실행 순서: [순서理由]
- 선택 이유: [각 스킬 선택理由]
```

### 상세 분석 프롬프트
```
너는 쇼핑몰 기획 전문가 에이전트의 스킬 라우터야.

사용자 질문: {user_input}

[스킬 목록과 설명]
{skills_description}

[작업 지침]
1. 사용자 질문의 핵심 의도를 파악해줘
2. 관련된 모든 스킬을 찾아줘
3. 실행 우선순위를 정해줘
4. 각 스킬이 왜 필요한지 이유를 설명해줘

[출력 형식]
```json
{
  "intent": "요약",
  "selectedSkills": [
    {"id": "스킬ID", "priority": 1, "reason": "선택理由"}
  ],
  "suggestedApproach": "권장 접근방식"
}
```
```
```

## 고급 기능

### 다중 의도 감지
```markdown
## 복합 의도 처리

프롬프트에 여러 의도가 포함된 경우:
1. 모든 의도识别
2. 의도별 스킬 선택
3. 통합 실행 계획 수립

예시: "30대 여성 뷰티 쇼핑몰 기획 + 마케팅 전략"
→ 분석 스킬 통합 → 전략 스킬 통합 → 설계 스킬 통합
```

### 컨텍스트 활용
```markdown
## 이전 세션 컨텍스트

이전 대화 내용이 있으면:
1. 연속성 유지 스킬 우선
2. 이전 결과 활용 스킬 연결
3. 맥락 이해도 향상

예시: 이미 타겟 분석 완료 → 다음 스킬로 경쟁 분석 진행
```
