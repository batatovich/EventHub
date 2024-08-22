import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const publicRoutes = ['/signin', '/signup'];

export default async function middleware(req) {
  const path = req.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);

  // Check if the session cookie exists
  const sessionCookie = cookies().get('session');
  
  if (!isPublicRoute && !sessionCookie) {
    // Redirect to sign-in page if the user is not authenticated
    return NextResponse.redirect(new URL('/signin', req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
