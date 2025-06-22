// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// IMPORTANT: The Firebase Admin SDK typically does NOT run directly in Next.js Middleware (Edge Runtime).
// Session cookie verification should happen in a Node.js environment (e.g., API route, getServerSideProps/Server Component).
// This middleware is for basic routing based on the *presence* of the session cookie.

export async function middleware(request: NextRequest) {
  // Retrieve the session cookie name provided by Firebase Hosting for framework integration.
  // This cookie is automatically managed by Firebase Hosting's framework integration.
  const sessionCookie = request.cookies.get('__session');
  const path = request.nextUrl.pathname;

  // Define public paths that don't require any authentication checks.
  // Make sure these match your actual public routes.
  const publicPaths = ['/', '/login', '/signup', '/about', '/contact']; // Add your public routes here

  const isPublicPath = publicPaths.includes(path);
  // For middleware, we typically check for the *presence* of the session cookie.
  // The actual *verification* of its validity happens in your server components or API routes.
  const isAuthenticated = !!sessionCookie; // Converts cookie presence to a boolean

  // --- Core Middleware Logic ---

  if (!isAuthenticated && !isPublicPath) {
    // Scenario 1: User is NOT authenticated AND trying to access a protected path.
    // Redirect them to the login page.
    console.log(`Redirecting unauthenticated user from ${path} to /login`);
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (isAuthenticated && (path === '/login' || path === '/signup')) {
    // Scenario 2: User IS authenticated AND trying to access the login/signup pages.
    // Redirect them to the main dashboard or home page (where they should go after logging in).
    console.log(`Redirecting authenticated user from ${path} to /dashboard`);
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard'; // Or your main application page
    return NextResponse.redirect(url);
  }

  // Scenario 3: Request can proceed.
  // - Authenticated user accessing a protected path.
  // - Unauthenticated user accessing a public path.
  console.log(`Allowing request for path: ${path}`);
  return NextResponse.next();
}

// Define the paths for which the middleware should run.
// This is critical for performance, ensuring the middleware only executes
// where truly needed.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (Next.js static files)
     * - _next/image (Next.js image optimization files)
     * - favicon.ico (favicon file)
     * - /api (if your API routes handle authentication separately, or are public)
     * - public assets like images, fonts, etc., directly in your /public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:png|jpg|jpeg|gif|webp|svg|css|js|map|json)$).*)',
  ],
};
