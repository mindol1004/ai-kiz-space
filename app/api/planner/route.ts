import { NextRequest, NextResponse } from 'next/server';
import { ShoppingPlannerAgent } from '@/core/main-agent';

// POST /api/planner
export async function POST(request: NextRequest) {
  try {
    const { prompt, context } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'prompt is required and must be a string' },
        { status: 400 }
      );
    }

    // 에이전트 생성 (싱글톤 패턴으로 개선 가능)
    const agent = ShoppingPlannerAgent.create();

    // 프로세스 실행
    const response = await agent.process(prompt, context);

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('API 에러:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/planner (상태 확인)
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'shopping-planner-agent',
    version: '1.0.0',
    skills: [
      'target-analysis',
      'competitor-analysis',
      'business-model',
      'category-design',
      'customer-analytics',
      'journey-design',
      'conversion-optimization',
      'pricing-strategy'
    ]
  });
}