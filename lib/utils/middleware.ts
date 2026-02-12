import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';

export interface AuthRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: 'admin' | 'customer';
  };
}

export function authenticateRequest(request: NextRequest): {
  user: { userId: string; email: string; role: 'admin' | 'customer' } | null;
  error: string | null;
} {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'No token provided' };
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    return { user: null, error: 'Invalid token' };
  }

  return { user: payload, error: null };
}

export function requireAuth(request: NextRequest): {
  user: { userId: string; email: string; role: 'admin' | 'customer' };
  error: null;
} | {
  user: null;
  error: string;
  response: NextResponse;
} {
  const { user, error } = authenticateRequest(request);

  if (!user) {
    return {
      user: null,
      error: error || 'Unauthorized',
      response: NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 }),
    };
  }

  return { user, error: null };
}

export function requireAdmin(request: NextRequest): {
  user: { userId: string; email: string; role: 'admin' };
  error: null;
} | {
  user: null;
  error: string;
  response: NextResponse;
} {
  const authResult = requireAuth(request);

  if (!authResult.user) {
    return authResult as any;
  }

  if (authResult.user.role !== 'admin') {
    return {
      user: null,
      error: 'Admin access required',
      response: NextResponse.json({ error: 'Admin access required' }, { status: 403 }),
    };
  }

  return { user: authResult.user as any, error: null };
}

