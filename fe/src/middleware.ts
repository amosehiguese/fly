import { NextRequest, NextResponse } from "next/server";
import { serviceSlugTranslations } from "./i18n/translationMap";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Create a handler function from next-intl middleware
const handleI18nRouting = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Extract locale from pathname - more reliable than the simple check
  const patternResult = new RegExp(`^/(${routing.locales.join("|")})/`).exec(
    pathname
  );
  const locale = patternResult ? patternResult[1] : routing.defaultLocale;

  // 1. Handle /stader -> /cities and /cities -> /stader
  if (locale === "en" && pathname.startsWith("/en/stader")) {
    return NextResponse.redirect(
      new URL(`/en/cities${pathname.substring(10)}`, request.url)
    );
  }
  if (locale === "sv" && pathname.startsWith("/sv/cities")) {
    return NextResponse.redirect(
      new URL(`/sv/stader${pathname.substring(10)}`, request.url)
    );
  }

  // New case: Handle incorrect service path structure after locale change
  if (locale === "en" && pathname.startsWith("/en/tjanster/")) {
    const slugMatch = pathname.match(/^\/en\/tjanster\/([a-z-]+)\/?$/i);
    if (slugMatch && slugMatch[1]) {
      const swedishSlug = slugMatch[1];
      const englishSlug =
        serviceSlugTranslations["sv"][
          swedishSlug as keyof (typeof serviceSlugTranslations)["sv"]
        ];
      if (englishSlug) {
        return NextResponse.redirect(
          new URL(`/en/services/${englishSlug}`, request.url)
        );
      }
    }
  }

  if (locale === "sv" && pathname.startsWith("/sv/services/")) {
    const slugMatch = pathname.match(/^\/sv\/services\/([a-z-]+)\/?$/i);
    if (slugMatch && slugMatch[1]) {
      const englishSlug = slugMatch[1];
      const swedishSlug =
        serviceSlugTranslations["en"][
          englishSlug as keyof (typeof serviceSlugTranslations)["en"]
        ];
      if (swedishSlug) {
        return NextResponse.redirect(
          new URL(`/sv/tjanster/${swedishSlug}`, request.url)
        );
      }
    }
  }

  // 2. Handle service detail page redirects
  const serviceMatchSv = pathname.match(/^\/sv\/tjanster\/([a-z-]+)\/?$/i);
  console.log("service match sv", serviceMatchSv);
  if (locale === "en" && serviceMatchSv && serviceMatchSv[1]) {
    const swedishSlug = serviceMatchSv[1];
    const englishSlug =
      serviceSlugTranslations["sv"][
        swedishSlug as keyof (typeof serviceSlugTranslations)["sv"]
      ];
    if (englishSlug) {
      return NextResponse.redirect(
        new URL(`/en/services/${englishSlug}`, request.url)
      );
    } else {
      console.warn(`No English slug found for Swedish slug: ${swedishSlug}`);
    }
  }

  const serviceMatchEn = pathname.match(/^\/en\/services\/([a-z-]+)\/?$/i);
  console.log("service match en", serviceMatchEn);
  if (locale === "sv" && serviceMatchEn && serviceMatchEn[1]) {
    const englishSlug = serviceMatchEn[1];
    const swedishSlug =
      serviceSlugTranslations["en"][
        englishSlug as keyof (typeof serviceSlugTranslations)["en"]
      ];
    if (swedishSlug) {
      return NextResponse.redirect(
        new URL(`/sv/tjanster/${swedishSlug}`, request.url)
      );
    }
  }

  // If none of our custom redirects matched, let next-intl handle the request
  return handleI18nRouting(request);
}

export const config = {
  // Match all pathnames except for those starting with /api, /_next, etc.
  // This ensures our middleware runs on all relevant routes
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
