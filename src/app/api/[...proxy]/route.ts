import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function handler(req: NextRequest, { params }: { params: Promise<{ proxy: string[] }> }) {
  const resolvedParams = await params;
  const path = resolvedParams.proxy ? resolvedParams.proxy.join('/') : '';
  const searchParams = req.nextUrl.search;
  
  // Format clean destination URL
  const targetBase = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
  const destinationUrl = `${targetBase}/${path}${searchParams}`;

  const headers = new Headers(req.headers);
  headers.set('host', new URL(targetBase).host);

  try {
    const response = await fetch(destinationUrl, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.blob() : undefined,
      // @ts-ignore
      duplex: 'half',
    });

    const responseHeaders = new Headers(response.headers);

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('API Proxy Error:', error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 502,
        message: 'Failed to connect to backend service',
        error: error instanceof Error ? error.message : 'Unknown proxy error',
      },
      { status: 502 }
    );
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
