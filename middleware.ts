import { NextResponse, type NextRequest } from 'next/server';

const MAIN_DOMAIN = 'www.xpresspoint.net';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const host = req.headers.get('host');

  if (!host) {
    return new Response('No host header', { status: 400 });
  }

  // Direct hostname (NO www removal)
  const hostname = host;

  // If on the main domain, do nothing
  if (hostname === MAIN_DOMAIN) {
    return NextResponse.next();
  }

  // Extract subdomain
  const subdomain = hostname.split('.')[0];

  // Rewrite to /register/<subdomain>...
  url.pathname = `/register/${subdomain}${url.pathname}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|register|login|signup).*)',
  ],
};
