// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// const PUBLIC_PATHS = ["/login", "/forgot-password", "/reset-password"];

// export function middleware(req: NextRequest) {
//   const { pathname } = req.nextUrl;

//   // Extract tenantId from subdomain (e.g. acme.coachgenie.com → "acme")
//   const hostname  = req.headers.get("host") ?? "";
//   const subdomain = hostname.split(".")[0];
//   const tenantId  = subdomain !== "localhost" && subdomain !== "www" ? subdomain : "demo";

//   // Clone headers and inject tenantId
//   const headers = new Headers(req.headers);
//   headers.set("x-tenant-id", tenantId);

//   const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

//   // Check auth cookie
//   const token = req.cookies.get("cg_access_token")?.value;

//   if (!isPublic && !token) {
//     const loginUrl = new URL("/login", req.url);
//     loginUrl.searchParams.set("callbackUrl", pathname);
//     return NextResponse.redirect(loginUrl);
//   }

//   if (isPublic && token) {
//     return NextResponse.redirect(new URL("/dashboard", req.url));
//   }

//   return NextResponse.next({ request: { headers } });
// }

// export const config = {
//   matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|ico)).*)"],
// };






// apps/admin/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/forgot-password", "/verify-otp", "/reset-password"];

export function middleware(request: NextRequest) {
  const token    = request.cookies.get("cg_access_token")?.value;
  const pathname = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!token && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (token && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|images).*)"],
};