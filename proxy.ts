import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function getTokenRole(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded.role || null;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    if (!decoded.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  } catch {
    return true;
  }
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value || request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;
  const isLoginPage = path.startsWith('/login');
  
  const isExpired = token ? isTokenExpired(token) : true;

  if ((!token || isExpired) && !isLoginPage) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    if (token) {
      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');
    }
    return response;
  }

  if (token && !isExpired && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (token && !isExpired && !isLoginPage) {
    const role = getTokenRole(token);
    if (role?.toLowerCase() !== 'admin') {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');
      return response;
    }
  }

  return NextResponse.next();
}

// Konfigurasi area mana aja yang dipatroli sama Middleware
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|logo.png|.*\\.png$).*)',
  ],
};