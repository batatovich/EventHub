import { NextResponse } from 'next/server';

export default function localeMiddleware(req) {
  const path = req.nextUrl.pathname;

  if (!path.startsWith('/en') && !path.startsWith('/es')) {
    const locale = req.headers.get('accept-language')?.split(',')[0].slice(0, 2) || 'en';
    return NextResponse.redirect(new URL(`/${locale}${path}`, req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
