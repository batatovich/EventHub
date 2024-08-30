import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const locales = ['en', 'es'];  
const baseRoutes = ['/signin', '/signup'];

const publicRoutes = locales.flatMap(locale =>
  baseRoutes.map(route => `/${locale}${route}`)
);

async function handleAuth(req) {
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

  // Check if the session cookie exists
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
      console.error('Session validation failed:', error);
      return NextResponse.redirect(new URL(`/${userLang}/signin`, req.nextUrl));
    }
  }

  if (!isPublicRoute && !sessionCookie) {
    return NextResponse.redirect(new URL(`/${userLang}/signin`, req.nextUrl));
  }

  return NextResponse.next();
}

function handleLocale(req) {
  console.log('hi');
  const pathname = req.nextUrl.pathname;
  const cookieStore = cookies();
  const userLang = cookieStore.get('user-lang');

  // If no cookie is set, default to English
  if (!userLang) {
    return NextResponse.redirect(new URL(`/en${pathname}`, req.nextUrl));
  }

  // Check if the current pathname already starts with the preferred language
  const currentLocale = pathname.split('/')[1]; // Get the first part of the path, e.g., 'en' or 'es'
  if (currentLocale === userLang.value) {
    // The path is already prefixed with the correct locale, no need to redirect
    return NextResponse.next();
  }

  // Redirect to the user's preferred language
  return NextResponse.redirect(new URL(`/${userLang.value}${pathname}`, req.nextUrl));
}

export default async function middleware(req) {
  let response;
  response = await handleAuth(req);
  //response = handleLocale(req);
  return response;
}

// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
