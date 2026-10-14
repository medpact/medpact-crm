
import { NextResponse } from "next/server"

export function proxy(request) {
  const host = (request.headers.get("host") || "")
    .split(":")[0]
    .toLowerCase()

  const pathname = request.nextUrl.pathname

  // Allow static files and assets through unchanged
  if (pathname.includes(".")) {
    return NextResponse.next()
  }

  // Medical tourism website
  if (host === "care.medpact.in") {
    // Already using the /medicalneeds prefix:
    // do not add it a second time
    if (
      pathname === "/medicalneeds" ||
      pathname.startsWith("/medicalneeds/")
    ) {
      return NextResponse.next()
    }

    // Map the domain root to the medical tourism homepage
    if (pathname === "/") {
      return NextResponse.rewrite(
        new URL("/medicalneeds", request.url)
      )
    }

    // Map shorter URLs to the medical tourism folder
    return NextResponse.rewrite(
      new URL(`/medicalneeds${pathname}`, request.url)
    )
  }

  // Public doctor recruitment website
  if (host === "www.medpact.in" || host === "medpact.in") {
    return NextResponse.rewrite(
      new URL(`/recruitment${pathname}`, request.url)
    )
  }

  // Internal CRM dashboard
  if (host === "dashboard.medpact.in") {
    if (pathname === "/") {
      return NextResponse.rewrite(
        new URL("/dashboard", request.url)
      )
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/((?!api|_next|favicon.ico).*)"],
}
