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
  
  // --- THIS IS THE FIX ---
  // If the user is on a subdomain AND trying to visit the root...
  if (url.pathname === '/') {
    // ...invisibly show them the registration page.
    url.pathname = `/register/${subdomain}`;
    return NextResponse.rewrite(url);
  }

  // If the user is on a subdomain AND trying to visit *any other page*...
  // (like /dashboard, /login, /verify-otp)
  // ...redirect them to the *main* domain.
  const mainDomainUrl = new URL(url.pathname, `https://${MAIN_DOMAIN}`);
  mainDomainUrl.search = url.search;
  return NextResponse.redirect(mainDomainUrl);
  // -----------------------
}

// "World-class" config: This middleware *only* runs
// for subdomains, not for your main app.
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
