// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { RoleType } from "@/db/schemas/roleSchema";
import { Errors } from "@/services/domainError";
import { SessionData } from "./app/(authenticated)/dashboard/types";

// Route Configurations
const PUBLIC_ROUTES = ["/", "/auth/signin", "/auth/signup"];

const AUTH_PROVIDERS = ["google", "discord"] as const;

const AUTH_PROVIDER_ROUTES = AUTH_PROVIDERS.flatMap((provider) => [
  `/auth/providers/${provider}`,
  `/auth/providers/${provider}/callback`,
]);

const SYSTEM_ROUTES = ["/_next", "/api", "/favicon.ico"];

// Helper Functions
const isPublicRoute = (pathname: string) => {
  if (PUBLIC_ROUTES.some((route) => pathname === route)) {
    return true;
  }

  if (pathname.startsWith("/auth/confirm/")) {
    return true;
  }

  return false;
};

const isSystemRoute = (pathname: string) =>
  SYSTEM_ROUTES.some((route) => pathname.startsWith(route));

const isAdminRoute = (pathname: string) => pathname.startsWith("/admin");

const isAuthProviderRoute = (pathname: string) => {
  return (
    AUTH_PROVIDER_ROUTES.some((route) => pathname === route) ||
    /^\/auth\/providers\/[^/]+(?:\/callback)?$/.test(pathname)
  );
};

const isValidCallbackUrl = (url: string) => {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return false;
  }

  if (isAuthProviderRoute(url) || url.startsWith("/auth/confirm/")) {
    return true;
  }

  return !isSystemRoute(url);
};

const createSignInRedirect = (
  request: NextRequest,
  errorCode?: string,
  callbackUrl?: string
) => {
  const searchParams = new URLSearchParams();

  if (errorCode) {
    searchParams.set("error", errorCode);
  }

  if (callbackUrl && isValidCallbackUrl(callbackUrl)) {
    searchParams.set("callbackUrl", callbackUrl);
  }

  const response = NextResponse.redirect(
    new URL(`/auth/signin?${searchParams}`, request.url)
  );

  response.cookies.delete("session");

  return response;
};

const getServiceUrl = (request: NextRequest) => {
  if (process.env.NODE_ENV === "production") {
    // In production, use internal container networking
    return "http://localhost:3000";
  }
  // For local development
  return request.nextUrl.origin;
};

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 1. Early returns for special routes
  if (isAuthProviderRoute(pathname)) {
    return NextResponse.next();
  }

  if (isSystemRoute(pathname)) {
    return NextResponse.next();
  }

  // 2. Callback URL validation
  const callbackUrl = searchParams.get("callbackUrl");
  if (callbackUrl && !isValidCallbackUrl(callbackUrl)) {
    const newUrl = new URL(request.url);
    newUrl.searchParams.delete("callbackUrl");
    return NextResponse.redirect(newUrl);
  }

  const sessionToken = request.cookies.get("session")?.value;

  // 3. Public Routes Handling
  if (isPublicRoute(pathname)) {
    if (!sessionToken) {
      return NextResponse.next();
    }

    try {
      const sessionResponse = await fetch(
        `${getServiceUrl(request)}/api/auth/validate-session`,
        {
          headers: {
            Cookie: `session=${sessionToken}`,
          },
        }
      );

      if (sessionResponse.ok) {
        // Only redirect to dashboard for signin/signup pages
        if (
          (pathname === "/auth/signin" || pathname === "/auth/signup") &&
          !pathname.startsWith("/auth/confirm/")
        ) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      } else {
        const errorData = await sessionResponse.json();
        return createSignInRedirect(request, errorData.type);
      }
    } catch (error) {
      console.error("Public route validation error:", error);
      return NextResponse.next();
    }

    return NextResponse.next();
  }

  // 4. Protected Routes Handling
  if (isAdminRoute(pathname)) {
    if (!sessionToken) {
      // If no session, redirect to sign in
      return createSignInRedirect(
        request,
        Errors.Auth.Unauthenticated,
        pathname
      );
    }

    // If has session, validate it first
    try {
      const sessionResponse = await fetch(
        `${getServiceUrl(request)}/api/auth/validate-session`,
        {
          headers: {
            Cookie: `session=${sessionToken}`,
          },
        }
      );

      if (!sessionResponse.ok) {
        return createSignInRedirect(
          request,
          Errors.Auth.Unauthenticated,
          pathname
        );
      }

      const sessionData = (await sessionResponse.json()) as SessionData;

      // Show 404 if user is authenticated but not an admin
      if (!sessionData.roles.some((role) => role.name === RoleType.Admin)) {
        return NextResponse.rewrite(new URL("/not-found", request.url));
      }
    } catch (error) {
      console.error("Admin route session validation error:", error);
      return createSignInRedirect(
        request,
        Errors.Server.InternalError,
        pathname
      );
    }
  }

  // Other protected routes redirect to login if no session
  if (!sessionToken) {
    return createSignInRedirect(request, Errors.Auth.Unauthenticated, pathname);
  }

  // 5. Session Validation for all other routes
  try {
    const sessionResponse = await fetch(
      `${getServiceUrl(request)}/api/auth/validate-session`,
      {
        headers: {
          Cookie: `session=${sessionToken}`,
        },
      }
    );

    if (!sessionResponse.ok) {
      const errorData = await sessionResponse.json();
      return createSignInRedirect(request, errorData.type, pathname);
    }

    // Session extension on GET requests
    if (request.method === "GET") {
      const response = NextResponse.next();
      response.cookies.set("session", sessionToken, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: "lax",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
      return response;
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Session validation error:", error);
    return createSignInRedirect(request, Errors.Server.InternalError, pathname);
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public/).*)"],
};
