import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxnf30MIYlhgXd0uhSszCaPtKngBuJ7q1Kc3yeo8pqihCRg0AzphC1mEPU4dTEi_xL_Og/exec';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = new URL(SCRIPT_URL);
    
    // Add function parameter
    if (body.function) {
      url.searchParams.set('function', body.function);
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('GAS Proxy Error:', error);
    return NextResponse.json({ error: 'Failed to proxy request' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(SCRIPT_URL);
    const { searchParams } = new URL(request.url);
    
    // Copy all search params
    searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });

    const response = await fetch(url.toString());
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('GAS Proxy Error:', error);
    return NextResponse.json({ error: 'Failed to proxy request' }, { status: 500 });
  }
}
