
import { NextResponse } from "next/server"

export function middleware(request) {
  const host = (request.headers.get("host") || "")
    .split(":")[0]
    .toLowerCase()

  const pathname = request.nextUrl.pathname

  // Medical tourism website
  if (host === "care.medpact.in") {
    const path = pathname === "/" ? "" : pathname

    return NextResponse.rewrite(
      new URL(`/medicaltourism${path}`, request.url)
    )
  }

  // Public doctors recruitment website
  if (host === "www.medpact.in" || host === "medpact.in") {
    return NextResponse.rewrite(
      new URL(`/recruitment${pathname}`, request.url)
    )
  }

  // Internal dashboard: route its homepage to the dedicated dashboard page.
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
