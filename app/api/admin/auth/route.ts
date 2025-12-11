// app/api/admin/auth/route.ts
// Simple admin authentication

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error('Admin credentials not configured');
      return NextResponse.json(
        { error: 'Authentication not configured' },
        { status: 500 }
      );
    }

    if (email === adminEmail && password === adminPassword) {
      // Create a simple session token (in production, use proper JWT)
      const sessionToken = Buffer.from(`${email}:${Date.now()}`).toString('base64');

      const response = NextResponse.json({ success: true });

      // Set HTTP-only cookie for session
      response.cookies.set('admin_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// Check if user is authenticated
export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get('admin_session');

  if (!sessionCookie?.value) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // Simple validation - check if cookie exists and is not expired
  try {
    const decoded = Buffer.from(sessionCookie.value, 'base64').toString();
    const [, timestamp] = decoded.split(':');
    const loginTime = parseInt(timestamp, 10);
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    if (loginTime > sevenDaysAgo) {
      return NextResponse.json({ authenticated: true });
    }
  } catch {
    // Invalid cookie format
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}

// Logout
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_session');
  return response;
}
