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
  url.pathname = `/register/${subdomain}`;
  return NextResponse.rewrite(url);
}

// --- THIS IS THE "WORLD-CLASS" FIX ---
// We "refurbish" the matcher to be "stunningly" simple.
// It will ONLY run on the root path ('/').
// It will *ignore* all other paths (like /_next/static/, /api/, etc.)
// This "stunningly" fixes the 404 loop.
export const config = {
  matcher: ['/'],
};
// ------------------------------------
