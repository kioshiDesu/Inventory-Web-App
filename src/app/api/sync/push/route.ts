import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { changes } = body;

    return NextResponse.json({
      success: true,
      accepted: changes.map((c: { entity: string; action: string; data: { id: number } }) => ({
        entity: c.entity,
        action: c.action,
        id: c.data?.id,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}
