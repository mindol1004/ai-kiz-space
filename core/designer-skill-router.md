# 디자이너 전문가용 스킬 라우터 확장

## 의도 분류 기준

### UX/UI 디자인
- 키워드: "UX", "UI", "디자인", "사용자경험", "인터페이스", "화면"
- 예시: "모바일 앱 UX 디자인해줘"

### 디자인 시스템
- 키워드: "디자인시스템", "컴포넌트", "토큰", "스타일가이드", "Storybook"
- 예시: "디자인 시스템 구축하고 싶어"

### 컬러/타이포그래피
- 키워드: "컬러", "색상", "타이포", "폰트", "폰트스케일", "팔레트"
- 예시: "브랜드 컬러 팔레트 추천해줘"

### 접근성 (A11y)
- 키워드: "접근성", "A11y", "WCAG", "스크린리더", "키보드", "색약"
- 예시: "웹사이트 접근성 검토해줘"

### 프로토타입
- 키워드: "프로토타입", "인터랙션", "애니메이션", "시나리오", "사용성"
- 예시: " checkout 프로세스 프로토타입 만들어줘"

### 정보 아키텍처
- 키워드: "정보", "사이트맵", "카테고리", "네비게이션", "분류"
- 예시: "이커머스 사이트맵 설계해줘"

### 와이어프레임
- 키워드: "와이어프레임", "레이아웃", "그리드", "구조", "배치"
- 예시: "dashboard 와이어프레임 그려줘"

### 디자인 검토
- 키워드: "검토", "리뷰", "피드백", "평가", "개선", "벤치마크"
- 예시: "현재 UI 디자인 검토해줘"

## 스킬 선택 매트릭스

### 1차 스킬 결정 (주 스킬)
| 의도 | 우선 선택 스킬 |
|------|---------------|
| 디자인 시스템 구축 | design-system, visual-design, prototyping |
| redesign/개선 | ux-research, wireframing, design-review |
| 접근성 개선 | accessibility, design-review, visual-design |
| 프로토타입 제작 | prototyping, wireframing, visual-design |
| UI/UX 검토 | design-review, accessibility, information-architecture |
| 컬러/타이포 | visual-design, design-system |
| 사용자 조사 | ux-research, information-architecture |
| 새 프로젝트 | ux-research → information-architecture → wireframing → visual-design |

### 2차 스킬 결정 (보조 스킬)
| 주 스킬 | 자동 추가 보조 스킬 |
|--------|------------------|
| ux-research | information-architecture |
| information-architecture | wireframing |
| wireframing | visual-design, prototyping |
| visual-design | design-system, accessibility |
| design-system | prototyping, accessibility |
| accessibility | design-review |
| prototyping | design-review |
| design-review | accessibility, visual-design |

## 실행 순서 결정 규칙

### 신규 프로젝트 (풀 사이클)
```
1. ux-research (사용자 조사)
2. information-architecture (정보 구조)
3. wireframing (와이어프레임)
4. visual-design (비주얼 디자인)
5. design-system (디자인 시스템 정립)
6. accessibility (접근성 검토)
7. prototyping (프로토타입)
8. design-review (최종 검토)
```

### redesign (개선)
```
1. design-review (현재 상태 검토)
2. ux-research (사용자 피드백)
3. wireframing (새 구조)
4. visual-design (새 비주얼)
5. accessibility (접근성 개선)
6. prototyping (테스트)
```

### 디자인 시스템 구축
```
1. visual-design (토큰 정의)
2. design-system (컴포넌트 설계)
3. accessibility (접근성 통합)
4. prototyping (Storybook)
5. design-review (품질 검토)
```

## 프롬프트 분석 예시

### 예시 1: 디자인 시스템 구축
```
입력: "Next.js + Tailwind로 디자인 시스템 구축하고 싶어"

분석:
- 의도: 디자인 시스템 구축
- 키워드: 디자인시스템, Next.js, Tailwind
- 기술스택: Next.js, Tailwind CSS
- 출력 요구: 컴포넌트 라이브러리, 토큰

선택된 스킬:
1. visual-design (우선순위: 1)
   이유: 컬러/타이포/간격 토큰 정의 필요
2. design-system (우선순위: 2)
   이유: 컴포넌트 라이브러리 구조 설계
3. accessibility (우선순위: 3)
   이유: WCAG 접근성 통합
4. prototyping (우선순위: 4)
   이유: Storybook 문서화
5. design-review (우선순위: 5)
   이유: 품질 검토 체크리스트
```

### 예시 2: 모바일 앱 redesign
```
입력: "모바일 쇼핑몰 앱이 복잡해요. 사용자 경험 간소화해줘"

분석:
- 의도: redesign, UX 개선
- 키워드: 모바일, 복잡, 간소화, UX
- 플랫폼: 모바일
- 문제: 복잡한 UI

선택된 스킬:
1. design-review (우선순위: 1)
   이유: 현재 디자인 문제점 식별
2. ux-research (우선순위: 2)
   이유: 사용자 불편사항 조사
3. wireframing (우선순위: 3)
   이유: 간소화된 와이어프레임
4. visual-design (우선순위: 4)
   이유: 새 비주얼 언어
5. prototyping (우선순위: 5)
   이유: 프로토타입 테스트
```

### 예시 3: 접근성 검토
```
입력: "웹사이트 접근성 문제가 있는지 전체적으로 검토해줘"

분석:
- 의도: 접근성 검토
- 키워드: 접근성, WCAG, 검토
- 범위: 전체 웹사이트

선택된 스킬:
1. accessibility (우선순위: 1)
   이유: WCAG 2.1 준수 검사
2. design-review (우선순위: 2)
   이유: 종합 디자인 평가
3. visual-design (우선순위: 3)
   이유: 색상 대비, 타이포그래피 검토
```

## 방법론별 특징

### User-Centered Design (사용자 중심 설계)
```
Process:
1. Research (조사)
   - 사용자 인터뷰
   - 설문조사
   - 사용성 테스트
2. Design (설계)
   - 사용자 여정 map
   - 페르소나 작성
   - 와이어프레임
3. Prototype (프로토타입)
   - Lo-fi → Hi-fi
   - 인터랙션 추가
4. Test (테스트)
   - 사용성 테스트
   - A/B 테스트
   - 피드백 수집
5. Iterate (迭代)
```

### Atomic Design (원자 설계 - Brad Frost)
```
Atoms (원자)
├── Button
├── Input
├── Text
└── Icon

Molecules (분자)
├── SearchBar (Input + Button)
├── Card (Image + Text + Button)
└── Navigation (Logo + Links)

Organisms (생명체)
├── Header (Navigation + Search + UserMenu)
├── ProductList (Card × N + Pagination)
└── Footer

Templates (템플릿)
├── HomePage
├── ProductDetailPage
└── CheckoutPage

Pages (페이지)
├── Home (실제 데이터)
├── Product/123 (실제 데이터)
└── Checkout/Success (실제 데이터)
```

### Design Tokens
```typescript
// 전역 디자인 토큰
export const tokens = {
  color: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',  // primary-500
      600: '#2563eb',
      900: '#1e40af'
    },
    gray: { /* ... */ }
  },
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  } as const,
  typography: {
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 700
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75
    }
  },
  borderRadius: {
    sm: '0.25rem',    // 4px
    md: '0.5rem',     // 8px
    lg: '1rem',       // 16px
    full: '9999px'
  },
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
  }
} as const;
```

## 스킬 상세 설명

### ux-research
**역할**: 사용자 조사 및 인사이트 도출
**입력**:
- `projectType`: 'web', 'mobile', 'desktop'
- `targetAudience`: 타겟 사용자 설명
- `researchMethods`: ['interview', 'survey', 'usability-test']
**출력**:
- 사용자 페르소나 (3-5개)
- 사용자 여정 map
- 인터뷰/설문 문항
- 인사이트 및 권고사항

### information-architecture
**역할**: 정보 구조 및 내비게이션 설계
**입력**:
- `contentItems`: 콘텐츠 목록
- `userGoals`: 사용자 목표
- `businessGoals`: 비즈니스 목표
**출력**:
- 사이트맵 (계층 구조)
- 카테고리 분류 체계
- 내비게이션 메뉴 구조
- 검색/필터 설계

### wireframing
**역할**: 레이아웃 및 정보 배치 설계
**입력**:
- `screenType`: 'home', 'list', 'detail', 'checkout'
- `layout`: 'grid', 'list', ' masonry'
- `sections`: 필요한 섹션 목록
**출력**:
- Lo-fi 와이어프레임 (Figma/HTML)
- 레이아웃 그리드 시스템
- 주석/annotation
- 인터랙션 플로우

### visual-design
**역할**: 컬러, 타이포, spacing 등 비주얼 시스템
**입력**:
- `brand`: 브랜드 이름/설명
- `industry`: 산업 (tech, finance, health, etc)
- `mood`: ['professional', 'friendly', 'luxury', 'minimal']
**출력**:
- 컬러 팔레트 (primary, secondary, semantic)
- 타이포그래fica scale (font-size, weight, line-height)
- spacing system (4px baseline)
- shadow/border radius
- Figma/Sketch library

### design-system
**역할**: 컴포넌트 라이브러리 및 문서화
**입력**:
- `framework`: 'react', 'vue', 'angular'
- `styling`: 'tailwind', 'css-modules', 'styled-components'
- `components`: 필요한 컴포넌트 목록
**출력**:
- 컴포넌트 구조 설계 (Button, Input, Card, ...)
- Storybook 설정 및 stories
- 컴포넌트 API 문서
- 버전 관리 가이드

### accessibility
**역할**: WCAG 2.1 준수 검토 및 가이드
**입력**:
- `designType`: 'web', 'mobile', 'desktop'
- `level`: 'AA' | 'AAA'
- `targetWCAG`: '2.1' | '2.2'
**출력**:
- 접근성 검토 리포트
- 색상 대비율 검사 결과
- 키보드 내비게이션 가이드
- ARIA 속성 사용 가이드
- 스크린리더 테스트 시나리오

### prototyping
**역할**: 인터랙션 및 프로토타입 제작
**입력**:
- `interactions`: 필요한 인터랙션 목록
- `device`: 'mobile', 'tablet', 'desktop'
- `fidelity`: 'low' | 'high'
**출력**:
- 프로토타입 (Figma/Framer 링크)
- 인터랙션 플로우 다이어그램
- 애니메이션 스펙 (duration, easing)
- 사용성 테스트 시나리오

### design-review
**역할**: 디자인 품질 검토 및 피드백
**입력**:
- `designDeliverables`: 검토할 디자인 자산
- `reviewScope`: ['ux', 'ui', 'a11y', 'brand']
- `competitors`: 벤치마크 경쟁사
**출력**:
- 검토 체크리스트 결과
- 강점/약점 분석
- 개선 로드맵 (우선순위별)
- 벤치마크 비교

## 확장 가이드

### 새로운 디자인 스킬 추가

1. **스킬 디렉토리 생성**:
```bash
mkdir -p skills/designer-expert/my-skill/
```

2. **index.ts 구현**:
```typescript
import type { SkillHandler, SkillInput, SkillOutput } from '@/types/skill';

export class MyDesignSkill implements SkillHandler {
  async execute(input: SkillInput): Promise<SkillOutput> {
    const { parameters } = input;

    // 디자인 로직
    const result = this.createDesign(parameters);

    return {
      status: 'success',
      result,
      summary: '디자인 생성 완료'
    };
  }

  getDependencies(): string[] {
    return ['previous-skill'];
  }

  getParameters(): ParameterSchema[] {
    return [
      { name: 'param', type: 'string', required: true }
    ];
  }
}
```

3. **README.md 작성**: 사용법, 파라미터, 예제 작성

4. **라우터 매핑**:
```typescript
// core/designer-skill-router.ts (존재한다면)
private getDesignerSkillMap(): Record<string, string[]> {
  return {
    '내 의도': ['my-skill', 'other-skill']
  };
}
```

5. **SkillRouter 확장**:
```typescript
// core/skill-router.ts
private analyzeDesignerPrompt(prompt: string): any {
  // 의도 분석 로직
}

private getDesignerSkillMap(): Record<string, string[]> {
  return { /* ... */ };
}
```

## 실제 프로젝트 적용 예시

### 요청: "이커머스 모바일 앱 디자인 시스템 구축"

**실행 계획:**

```
1. ux-research
   - 타겟 사용자 조사 (20-40대 온라인 쇼핑객)
   - 페르소나 3개 생성
   - 사용자 여정 map (발견 → 구매 → 재구매)

2. information-architecture
   - 사이트맵: 홈, 카테고리, 상품상세, 장바구니, 결제, 마이페이지
   - 카테고리 분류: 5개 대분류, 20개 중분류
   - 내비게이션: 하단 탭 메뉴 (홈, 카테고리, 검색, 장바구니, 마이)

3. wireframing
   - Lo-fi 와이어프레임 10개 화면
   - 8dp grid system
   - iOS/Android 대응 레이아웃

4. visual-design
   - 컬러 팔레트: primary (#3b82f6), secondary (#64748b)
   - 타이포: Noto Sans KR (regular, medium, bold)
   - spacing: 4px baseline (xs:4, sm:8, md:16, lg:24, xl:32)
   - radius: sm:4px, md:8px, lg:16px

5. design-system
   - 컴포넌트: Button, Input, Card, Badge, Modal, BottomSheet
   - Storybook 설정
   - React 컴포넌트 구현 (TypeScript)

6. accessibility
   - 색상 대비율 검사 (모두 4.5:1 이상)
   - TalkBack/VoiceOver 호환성
   - 키보드 내비게이션 (Switch control)

7. prototyping
   - Figma 프로토타입 제작
   - 인터랙션: 장바구니 추가, 결제 flow
   - Lottie 애니메이션 (로딩, 성공)

8. design-review
   - 품질 검토: 30개 체크리스트
   - 사용성 테스트: 5명 대상
   - 개선사항 정리
```

**생성된 결과:**

- `design-system/tokens/`: 컬러, 타이포, 간격 토큰 (TypeScript)
- `design-system/components/`: Button, Input, Card 컴포넌트
- `figma/design-system.fig`: Figma library file
- `storybook/`: Storybook 7.0 설정
- `accessibility/report.md`: WCAG AA 준수 리포트
- `wireframes/`: Lo-fi 와이어프레임 (Figma)
- `review/feedback.md`: 사용성 테스트 피드백 및 개선로드맵

## 주의사항

1. **디자인 → 개발 핸드오프**: 디자인 시스템이 실제 코드로 구현 가능해야 함
2. **모바일 퍼스트**: 모바일에서 데스크탑 순으로 설계
3. **접근성 필수**: 모든 디자인은 WCAG AA 준수 목표
4. **브랜드 일관성**: 컬러/타이포는 브랜드 가이드라인 준수
5. **iterative**: 사용자 테스트를 통한 지속적 개선

## 체크리스트

### 프로젝트 시작 전
- [ ] 브랜드 가이드라인 확인
- [ ] 타겟 사용자 정의
- [ ] 플랫폼 결정 (Web/iOS/Android)
- [ ] 접근성 목표 설정 (AA/AAA)

### 디자인 과정
- [ ] 사용자 조사 완료
- [ ] 사이트맵/IA 설계
- [ ] 와이어프레임 검토
- [ ] 비주얼 디자인 시스템 정의
- [ ] 컴포넌트 라이브러리 구축
- [ ] 접근성 검사 수행
- [ ] 프로토타입 테스트

### 배포 전
- [ ] 디자인 시스템 문서화 완료
- [ ] Storybook 배포
- [ ] 개발자용 가이드 제공
- [ ] Figma 파일 정리
- [ ] 접근성 최종 검증

## 참고 자료

- [Material Design](https://m3.material.io/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines)
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [Atomic Design - Brad Frost](https://bradfrost.com/blog/post/atomic-web-design/)
- [Design Tokens - Salesforce](https://www.designsystems.com/patterns/design-tokens/)
- [Figma API](https://www.figma.com/developers/api)
- [Storybook](https://storybook.js.org/)
- [A11y Project](https://www.a11yproject.com/)