import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    // Protect all routes except static and Next.js internals
    '/((?!_next|.*\\..*|favicon.ico).*)',
    '/(api|trpc)(.*)', // Match API routes too
  ],
};
