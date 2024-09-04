import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const locales = ['en', 'es'];
const baseRoutes = ['/signin', '/signup'];

const publicRoutes = locales.flatMap(locale =>
  baseRoutes.map(route => `/${locale}${route}`)
);

function clearCookiesAndRedirect(req, userLang) {
  const redirectResponse = NextResponse.redirect(new URL(`/${userLang}/signin`, req.nextUrl));

  // Clear the session cookie
  redirectResponse.cookies.set('session', '', {
    path: '/',
    expires: new Date(0),
  });

  return redirectResponse;
}

export default async function middleware(req) {
  const path = req.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);
  const cookieStore = cookies();

  // Default language to 'en' if no language cookie is set
  let userLang = cookieStore.get('user-lang')?.value || 'en';
  if (!cookieStore.get('user-lang')) {
    const langResponse = NextResponse.next();
    langResponse.cookies.set('user-lang', 'en', { path: '/' });
    return langResponse;
  }

  const sessionCookie = cookieStore.get('session');

  if (!isPublicRoute && sessionCookie) {
    try {
      const sessionValidationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/validate-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `session=${sessionCookie.value}`,
        },
        credentials: 'include',
      });
  
      const result = await sessionValidationResponse.json();
  
      if (result.status === 'success') {
        return NextResponse.next(); 
      } else if (result.status === 'fail') {
        console.error('Session validation failed:', result.data.message);
        return clearCookiesAndRedirect(req, userLang);
      } else if (result.status === 'error') {
        console.error('Server error during session validation:', result.message);
        return clearCookiesAndRedirect(req, userLang);
      }
  
    } catch (error) {
      console.error('Session validation error:', error);
      return clearCookiesAndRedirect(req, userLang); 
    }
  }
  
  if (!isPublicRoute && !sessionCookie) {
    return clearCookiesAndRedirect(req, userLang);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
