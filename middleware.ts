import { NextResponse, type NextRequest } from 'next/server';

// This is your main domain
const MAIN_DOMAIN = 'xpresspoint.net';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const host = req.headers.get('host');

  if (!host) {
    return new Response('No host header', { status: 400 });
  }

  // Remove 'www.'
  const hostname = host.replace(/^www\./, '');

  // If they are on the main domain, do nothing.
  if (hostname === MAIN_DOMAIN) {
    return NextResponse.next();
  }

  // This extracts the 'luminax' from 'luminax.xpresspoint.net'
  const subdomain = hostname.split('.')[0];
  
  // This invisibly rewrites the URL. The user *sees* 'luminax.xpresspoint.net'
  // but the server *shows* them the content from '/register/luminax'
  url.pathname = `/register/${subdomain}${url.pathname}`;
  return NextResponse.rewrite(url);
}

// --- THIS IS THE FIX ---
// We have added 'verify-otp' to the list of paths to *ignore*.
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|register|login|signup|verify-otp).*)',
  ],
};
// -----------------------
