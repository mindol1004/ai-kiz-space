# 디자이너 전문가 (Design Expert)

## 역할

소프트웨어 사용자 경험(UX)과 시각적 디자인(UI)을 종합적으로 설계하는 전문가 에이전트입니다. 사용자 리서치, 정보 아키텍처, 인터랙션 디자인, 비주얼 디자인, 접근성, 디자인 시스템 등 현대적인 디자인 전방위를 지원합니다.

## 아키텍처

```
사용자 요청 (예: "이커머스 앱 UX redesign 해줘")
    ↓
스킬 라우터 (의도 분석 → 디자인 스킬 선택)
    ↓
스킬 실행기 (의존성 고려 실행)
    ↓
디자인 스킬들
├── ux-research         (사용자 조사)
├── information-architecture (정보 아키텍처)
├── wireframing         (와이어프레임)
├── visual-design       (비주얼 디자인)
├── design-system       (디자인 시스템)
├── accessibility        (접근성 검토)
├── prototyping         (프로토타입)
└── design-review       (디자인 검토)
    ↓
통합 결과 (디자인 가이드, 컴포넌트 라이브러리, 피드백)
```

## 핵심 스킬

### 1. UX Research (사용자 조사)
- 사용자 페르소나 생성
- 사용자 여정 지도 (User Journey Map)
- 인터뷰/설문조사 가이드
- 인사이트 분석

### 2. Information Architecture (정보 아키텍처)
- 사이트맵 설계
- 카테고리 분류 (Card Sorting)
- 내비게이션 구조
- 콘텐츠 계층

### 3. Wireframing (와이어프레임)
- Low-fidelity 와이어프레임
- 레이아웃 그리드 시스템
- 정보 배치 구조
- 상호작용 흐름

### 4. Visual Design (비주얼 디자인)
- 컬러 팔레트 생성
- 타이포그래피 시스템
- 여백/격자 (Spacing & Grid)
- 아이콘/이미지 가이드
- 브랜드 시각 identity

### 5. Design System (디자인 시스템)
- 컴포넌트 라이브러리 설계
- 토큰 시스템 (색상, 타이포, 간격)
- Storybook 문서화
- 버전 관리 가이드

### 6. Accessibility (접근성)
- WCAG 2.1 준수 검토
- 색상 대비율 검사
- 키보드 내비게이션
- 스크린리더 호환성
- A11y 테스트 가이드

### 7. Prototyping (프로토타입)
- 인터랙션 플로우
- 애니메이션/마이크로인터랙션
- 프로토타입 도구 추천 (Figma, Framer)
- 사용성 테스트 시나리오

### 8. Design Review (디자인 검토)
- 디자인 평가 체크리스트
- 경쟁사 벤치마크
- 사용성 테스트 피드백
- 개선 로드맵

## 사용 예시

### 예시 1: 새 프로젝트 디자인 시스템 구축
```
사용자: "Next.js + Tailwind로 디자인 시스템 구축하고 싶어. 컴포넌트 라이브러리"];
에이전트 실행:
1. ux-research: 사용자 조사 가이드
2. information-architecture: 사이트맵 설계
3. visual-design: 컬러/타이포 시스템
4. design-system: 컴포넌트 라이브러리 구조
5. accessibility: 접근성 가이드라인
6. prototyping: Storybook 설정
7. design-review: 품질 검토 체크리스트
```

### 예시 2: 기존 제품 redesign
```
사용자: "모바일 쇼핑몰 앱 UX가 복잡해요. 간소화해줘"
에이전트 실행:
1. ux-research: 현재 사용성 문제 분석
2. information-architecture: 카테고리 재구성
3. wireframing: 단순화된 와이어프레임
4. visual-design: 새 컬러/레이아웃
5. accessibility: 개선된 접근성
6. prototyping: 프로토타입 제작
7. design-review: redesign 검토
```

## 의도 분류

| 의도 | 주요 스킬 |
|------|-----------|
| 디자인 시스템 구축 | design-system, visual-design, prototyping |
| redesign/개선 | ux-research, wireframing, design-review |
| 접근성 개선 | accessibility, design-review |
| 프로토타입 제작 | prototyping, wireframing, visual-design |
| UI/UX 검토 | design-review, accessibility, information-architecture |
| 컬러/타이포 | visual-design, design-system |
| 사용자 조사 | ux-research, information-architecture |

## 스킬 의존성

```
ux-research: []
information-architecture: [ux-research]
wireframing: [information-architecture]
visual-design: [wireframing]
design-system: [visual-design, wireframing]
accessibility: [visual-design]
prototyping: [wireframing, visual-design]
design-review: [all skills]
```

## 출력 포맷

```typescript
interface DesignResponse {
  methodology: 'User-Centered Design' | 'Design Thinking' | 'Lean UX';
  deliverables: {
    persona: UserPersona[];
    journeyMap: JourneyMap;
    wireframe: Wireframe[];
    visualDesign: VisualDesignSystem;
    designSystem: DesignSystem;
    accessibility: AccessibilityReport;
    prototype: PrototypeSpec;
    review: DesignReview;
  };
  assets: {
    colorPalette: Color[];
    typography: TypographyScale;
    components: ComponentSpec[];
    icons: IconSpec[];
  };
  guidelines: {
    principles: string[];
    doDonTs: { do: string[], dont: string[] };
    bestPractices: string[];
  };
  tools: {
    design: string[];      // Figma, Sketch, XD
    prototyping: string[]; // Framer, ProtoPie
    collaboration: string[]; // Miro, Notion
  };
}
```

## UI/UX 디자인 원칙

### 1. 사용자 중심 설계 (User-Centered Design)
- 사용자 조사 먼저
- 사용자 여정 맵핑
- 접근성 고려
- 반복적인 테스트

### 2. 일관성 (Consistency)
- 시각적 일관성 (컬러, 타이포, 간격)
- 상호작용 일관성
- 플랫폼 컨벤션 준수

### 3. 단순성 (Simplicity)
- 불필요한 요소 제거
- 명확한 계층 구조
- 직관적 네비게이션

### 4. 피드백 (Feedback)
- 즉각적인 시각적 피드백
- 로딩/에러 상태 명시
- 진행 상황 표시

### 5. 유연성 (Flexibility)
- 다양한 화면 크기 대응
- 키보드/마우스/터치 모두 지원
- 개인화 옵션

## 디자인 시스템 구조

```
design-system/
├── tokens/
│   ├── colors.ts          # 색상 토큰 (primary, secondary, ...)
│   ├── typography.ts      # 타이포그래피 토큰
│   ├── spacing.ts         # 간격 토큰 (4px baseline)
│   ├── shadows.ts         # 그림자 토큰
│   └── breakpoints.ts     # 반응형 브레이크포인트
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.module.css
│   │   ├── Button.test.tsx
│   │   ├── Button.stories.tsx (Storybook)
│   │   └── index.ts
│   ├── Input/
│   └── Modal/
├── patterns/
│   ├── forms/
│   ├── navigation/
│   └── data-display/
├── guidelines/
│   ├── accessibility.md
│   ├── usage.md
│   └── contribution.md
└── README.md
```

### 토큰 예시 (Tailwind CSS)

```typescript
// tokens/colors.ts
export const colors = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    // ...
    500: '#3b82f6',  // primary-500
    600: '#2563eb',
    // ...
  },
  gray: { /* ... */ },
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  }
} as const;

// tokens/spacing.ts
export const spacing = {
  0: '0rem',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  4: '1rem',     // 16px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  // 4px baseline grid
} as const;
```

## 컬러 시스템

### 1. 브랜드 컬러
```typescript
// 60-30-10 규칙
const colorPalette = {
  primary: '#3b82f6',      // 60% - 주요 브랜드 컬러
  secondary: '#64748b',    // 30% - 보조 컬러
  accent: '#f59e0b',       // 10% - 강조 컬러
  neutral: {
    50: '#fafafa',
    100: '#f4f4f5',
    // ...
    900: '#18181b'
  }
};
```

### 2. 접근성 (WCAG AA)
- **Normal text**: 대비율 ≥ 4.5:1
- **Large text**: 대비율 ≥ 3:1
- **UI components**: 대비율 ≥ 3:1

```typescript
function checkContrast(foreground: string, background: string): {
  ratio: number;
  pass: boolean;
  level: 'AA' | 'AAA' | 'FAIL';
} {
  // luminance 계산 로직
  // ...
}
```

## 타이포그래fica 시스템

### 1. 스케일 (Modular Scale)
```typescript
const fontSizes = {
  xs: '0.75rem',   // 12px
  sm: '0.875rem',  // 14px
  base: '1rem',    // 16px (기준)
  lg: '1.125rem',  // 18px
  xl: '1.25rem',   // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem',  // 36px
  '5xl': '3rem',     // 48px
  '6xl': '3.75rem',  // 60px
} as const;
```

### 2. 폰트 패밀리
```typescript
const fonts = {
  sans: {
    regular: 'Inter, system-ui, sans-serif',
    medium: 'Inter, system-ui, sans-serif',
    bold: 'Inter, system-ui, sans-serif'
  },
  mono: {
    regular: 'JetBrains Mono, monospace'
  }
};
```

### 3. 라인 높이
```typescript
const lineHeights = {
  tight: 1.2,    // 제목
  normal: 1.5,   // 본문
  relaxed: 1.75  // 긴 글
};
```

## 와이어프레임 구조

### Low-fidelity (Lo-fi)
```typescript
interface Wireframe {
  layout: 'header' | 'sidebar' | 'grid' | 'list';
  sections: WireframeSection[];
  annotations: Annotation[];
  interactions: InteractionFlow[];
}

// 예시: 이커머스 제품 목록页
const productListWireframe: Wireframe = {
  layout: 'grid',
  sections: [
    { id: 'header', type: 'header', elements: ['logo', 'search', 'cart'] },
    { id: 'filters', type: 'sidebar', elements: ['category', 'price', 'brand'] },
    { id: 'products', type: 'grid', elements: ['product-card × 12'] },
    { id: 'pagination', type: 'footer', elements: ['page-numbers'] }
  ],
  annotations: [
    { element: 'product-card', note: '이미지, 제목, 가격, 장바구니 버튼' }
  ]
};
```

## 프로토타입

### 1. 인터랙션 플로우
```typescript
interface PrototypeFlow {
  name: string;
  startScreen: string;
  steps: PrototypeStep[];
}

const checkoutFlow: PrototypeFlow = {
  name: '결제 프로세스',
  startScreen: 'product-detail',
  steps: [
    { from: 'product-detail', to: 'cart', trigger: '장바구니 클릭' },
    { from: 'cart', to: 'shipping', trigger: '주문하기 클릭' },
    { from: 'shipping', to: 'payment', trigger: '다음' },
    { from: 'payment', to: 'confirmation', trigger: '결제 완료' }
  ]
};
```

### 2. 마이크로인터랙션
```typescript
interface MicroInteraction {
  element: string;
  trigger: 'hover' | 'click' | 'focus' | 'load';
  animation: {
    duration: number;  // ms
    easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
    keyframes: Keyframe[];
  };
  feedback: 'visual' | 'haptic' | 'audio';
}
```

## 접근성 (A11y) 검토

### WCAG 2.1 체크리스트

#### Perceivable (인지 가능)
- [ ] 모든 비디오에 자막 제공
- [ ] 오디오에 텍스트 대체 제공
- [ ] 색상만으로 정보 전달하지 않음
- [ ] 텍스트 크기/간격 조절 가능 (200% 이상)
- [ ] 이미지에 alt 텍스트 제공

#### Operable (운영 가능)
- [ ] 키보드로 모든 기능 접근 가능
- [ ] 포커스 표시 명확
- [ ] 충분한 클릭 영간 (44×44px)
- [ ] 시간 제한 있는 콘텐츠 제공
- [ ] epileptic-safe 애니메이션 (깜빡임 3회 미만)

#### Understandable (이해 가능)
- [ ] 언어 속성 지정 (lang attribute)
- [ ] 예측 가능한 내비게이션
- [ ] 오류 메시지 명확하고 제안 포함
- [ ] 라벨/지시사항 명확

#### Robust (견고)
- [ ] valid HTML/CSS
- [ ] ARIA 역할/상태/속성 올바른 사용
- [ ] 스크린리더 호환성

### 색상 대비율 검사 도구
- Lighthouse
- axe DevTools
- Color Contrast Analyzer

## 디자인 검토

### 검토 체크리스트

#### UX
- [ ] 사용자 목표 달성 가능?
- [ ] 내비게이션 직관적?
- [ ] 오류 상태 명확?
- [ ] 로딩/빈 상태 처리?
- [ ] 모바일/태블릿/데스크탑 모두 대응?

#### UI
- [ ] 시각적 계층 명확?
- [ ] 컬러 팔레트 일관성?
- [ ] 타이포그래피 가독성?
- [ ] 간격/격자 준수?
- [ ] 아이콘/이미지 일관성?

#### 접근성
- [ ] 색상 대비 WCAG AA 충족?
- [ ] 키보드 내비게이션 가능?
- [ ] 스크린리더 호환?
- [ ] 포커스 관리 적절?
- [ ] ARIA 속성 올바름?

#### 성능
- [ ] 이미지 최적화 (WebP, lazy loading)?
- [ ] 폰트 로딩 전략 (font-display: swap)?
- [ ] CSS 번들 크기 적절?
- [ ] Critical CSS 적용?

## 디자인 도구

### 1. UI/UX 디자인
- **Figma**: 협업 중심, 디자인 시스템 구축
- **Sketch**: macOS 전용, 커뮤니티 플러그인 많음
- **Adobe XD**: Adobe 생태계 통합
- **Penpot**: 오픈소스, Self-host 가능

### 2. 프로토타이핑
- **Framer**: 코드 기반 인터랙션
- **ProtoPie**: 고급 상호작용
- **Principle**: macOS 전용 애니메이션

### 3. 협업/문서
- **Miro**: 사용자 여정/와이어프레임
- **Notion**: 디자인 요구사항 문서화
- **Zeroheight**: 디자인 시스템 문서

### 4. 접근성 검사
- **axe DevTools**: 자동화된 a11y 검사
- **Lighthouse**: 성능 + 접근성
- **WAVE**: 웹 접근성 평가

## 스킬 구현 템플릿

```typescript
import type { SkillHandler, SkillInput, SkillOutput } from '@/types/skill';

export class VisualDesignSkill implements SkillHandler {
  async execute(input: SkillInput): Promise<SkillOutput> {
    const { brand, industry, targetAudience } = input.parameters;

    // 컬러 팔레트 생성
    const palette = this.generateColorPalette(brand, industry);

    // 타이포그래피 시스템
    const typography = this.designTypography(targetAudience);

    // 간격/격자
    const spacing = this.defineSpacingSystem();

    const result = {
      colorPalette: palette,
      typography,
      spacing,
      guidelines: this.generateGuidelines(palette, typography),
      figmaTokens: this.exportFigmaTokens(palette, typography, spacing)
    };

    return {
      status: 'success',
      result,
      summary: '비주얼 디자인 시스템 생성 완료'
    };
  }

  getDependencies(): string[] {
    return ['wireframing']; // 와이어프레임 이후
  }

  getParameters(): ParameterSchema[] {
    return [
      { name: 'brand', type: 'string', required: true },
      { name: 'industry', type: 'string', required: false, default: 'tech' },
      { name: 'targetAudience', type: 'string', required: false }
    ];
  }
}
```

## 의존성 그래프 예시

```
ux-research (독립)
    ↓
information-architecture (ux-research 필요)
    ↓
wireframing (information-architecture 필요)
    ↓
visual-design (wireframing 필요)
design-system (visual-design, wireframing 필요)
accessibility (visual-design 필요)
prototyping (wireframing, visual-design 필요)
design-review (모든 스킬 필요)
```

## 실제 작업 흐름

### 신규 프로젝트 디자인
```
Week 1: ux-research + information-architecture
Week 2: wireframing (Lo-fi → Hi-fi)
Week 3: visual-design + design-system
Week 4: prototyping + accessibility
Week 5: design-review + iteration
```

### redesign
```
Week 1: design-review (현재 분석) + ux-research
Week 2: wireframing (새로운 구조)
Week 3: visual-design
Week 4: prototyping + accessibility
Week 5: 테스트 + iteration
```

## 파일/자산 출력

각 스킬은 다음을 생성합니다:

1. ** design-system/tokens/** - 컬러, 타이포, 간격 토큰
2. **figma/** - Figma library 파일 (프로토타입)
3. **storybook/** - Storybook 설정 및 컴포넌트
4. **guidelines/** - 접근성, 사용 가이드 마크다운
5. **review/** - 검토 리포트, 개선사항

## 주의사항

1. **브랜드 일관성**: 디자인 시스템은 브랜드 아이덴티티와 일치해야 함
2. **접근성 필수**: 모든 디자인은 WCAG AA 준수
3. **모바일 퍼스트**: 모바일에서 데스크탑 순으로 설계
4. **설계 → 구현**: 디자인 시스템이 실제 코드와 일치해야 함
5. **迭代**: 사용자 테스트를 통한 지속적 개선

## 참고 자료

- [Material Design](https://material.io/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines)
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [Atomic Design - Brad Frost](https://bradfrost.com/blog/post/atomic-web-design/)
- [Design Systems - Allison Wagner](https://www.designsystems.com/)