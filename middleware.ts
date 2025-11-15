import { NextResponse, type NextRequest } from 'next/server';

// This is your "world-class" main domain
const MAIN_DOMAIN = 'xpresspoint.net';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const host = req.headers.get('host');

  if (!host) {
    return new Response('No host header', { status: 400 });
  }

  // "Refurbish" the host to remove 'www.'
  const hostname = host.replace(/^www\./, '');

  // "Stunning" check: If they are on the main domain, do nothing.
  if (hostname === MAIN_DOMAIN) {
    return NextResponse.next();
  }

  // "World-Class" Subdomain Logic
  // This "fetches" the 'quadrox' from 'quadrox.xpresspoint.net'
  const subdomain = hostname.split('.')[0];
  
  // "Stunningly" rewrite the URL. The user *sees* 'quadrox.xpresspoint.net'
  // but the server *shows* them the content from '/register/quadrox'
  url.pathname = `/register/${subdomain}${url.pathname}`;
  return NextResponse.rewrite(url);
}

// "World-class" config: This middleware *only* runs
// for subdomains, not for your main app.
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
