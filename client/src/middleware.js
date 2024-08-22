import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const publicRoutes = ['/signin', '/signup'];

export default async function middleware(req) {
  const path = req.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);

  // Check if the session cookie exists
  const sessionCookie = cookies().get('session');

  if (!isPublicRoute && sessionCookie) {
    try {
      // Make a request to the backend to validate the session
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/validate-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `session=${sessionCookie.value}`,
        },
      });

      if (response.status !== 200) {
        return NextResponse.redirect(new URL('/signin', req.nextUrl));
      }

      const result = await response.json();  

      if (!result.valid) {
        return NextResponse.redirect(new URL('/signin', req.nextUrl));
      }

      return NextResponse.next();

    } catch (error) {
      console.error('Session validation failed:', error);
      return NextResponse.redirect(new URL('/signin', req.nextUrl));
    }
  }

  if (!isPublicRoute && !sessionCookie) {
    return NextResponse.redirect(new URL('/signin', req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
