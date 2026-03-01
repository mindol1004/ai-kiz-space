import { NextRequest, NextResponse } from 'next/server';

// POST /api/planner
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'prompt is required and must be a string' },
        { status: 400 }
      );
    }

    // TODO: core/main-agent.ts 구현 후 ShoppingPlannerAgent 연동
    return NextResponse.json(
      {
        status: 'not_implemented',
        message: 'ShoppingPlannerAgent is not yet implemented. See core/main-agent.md for the implementation guide.',
        prompt
      },
      { status: 501 }
    );
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
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'ok',
    service: 'shopping-planner-agent',
    version: '1.0.0',
    implemented: false,
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
