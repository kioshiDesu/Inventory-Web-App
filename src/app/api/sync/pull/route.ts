import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const since = searchParams.get('since');

  return NextResponse.json({
    items: [],
    transactions: [],
    categories: [],
    serverTime: new Date().toISOString(),
  });
}
