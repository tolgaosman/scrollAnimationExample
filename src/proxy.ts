import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * Next.js 16 "proxy" (formerly middleware): resolves the locale for every
 * page request and rewrites "/" → "/tr" internally, "/en/beans" → "/en/cekirdekler".
 */
export default createMiddleware(routing);

export const config = {
  // Skip Next internals, API routes and any path containing a dot (static files like /frames/*.jpg).
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
