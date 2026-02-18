import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const CORS_HEADERS = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  'Access-Control-Allow-Headers':
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
  'Access-Control-Max-Age': '86400',
};

function getAllowedOrigins(): string[] {
  const origins: string[] = [];
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    origins.push(process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, ''));
  }
  if (process.env.VERCEL_URL) {
    origins.push(`https://${process.env.VERCEL_URL}`);
    origins.push(`https://www.${process.env.VERCEL_URL}`);
  }
  if (process.env.ALLOWED_ORIGINS) {
    origins.push(
      ...process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
    );
  }
  origins.push('http://localhost:3000', 'http://127.0.0.1:3000');
  return [...new Set(origins)];
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const origin = request.headers.get('origin');
  const allowed = getAllowedOrigins();
  const allowOrigin =
    origin && allowed.some((o) => origin === o || origin === o.replace(/^https/, 'http'))
      ? origin
      : allowed[0] || 'http://localhost:3000';

  const headers = new Headers(CORS_HEADERS);
  headers.set('Access-Control-Allow-Origin', allowOrigin);

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers });
  }

  const response = NextResponse.next();
  headers.forEach((value, key) => response.headers.set(key, value));
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
