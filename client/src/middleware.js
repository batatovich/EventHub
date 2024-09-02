import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const locales = ['en', 'es'];
const baseRoutes = ['/signin', '/signup'];

const publicRoutes = locales.flatMap(locale =>
  baseRoutes.map(route => `/${locale}${route}`)
);

export default async function middleware(req) {
  const path = req.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);

  // Default language to 'en' if no language cookie is set
  const cookieStore = cookies();
  let userLang = cookieStore.get('user-lang')?.value || 'en';

  // Set the default language cookie if it doesn't exist
  if (!cookieStore.get('user-lang')) {
    const response = NextResponse.next();
    response.cookies.set('user-lang', 'en', { path: '/' });
    return response;
  }

  if (process.env.enableAuth) {
    const sessionCookie = cookieStore.get('session');
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
          return NextResponse.redirect(new URL(`/${userLang}/signin`, req.nextUrl));
        }

        const result = await response.json();

        if (!result.valid) {
          return NextResponse.redirect(new URL(`/${userLang}/signin`, req.nextUrl));
        }

        return NextResponse.next();

      } catch (error) {
        return NextResponse.redirect(new URL(`/${userLang}/signin`, req.nextUrl));
      }
    }

    if (!isPublicRoute && !sessionCookie) {
      return NextResponse.redirect(new URL(`/${userLang}/signin`, req.nextUrl));
    }

    return NextResponse.next();
  };
}

// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
