
import { NextResponse } from "next/server"

export function proxy(request) {
  const host = (request.headers.get("host") || "")
    .split(":")[0]
    .toLowerCase()

  const pathname = request.nextUrl.pathname

 // Medical tourism website
if (host === "care.medpact.in") {
  // Let Next.js serve public assets directly.
  if (
    pathname.startsWith("/medicalneeds/") &&
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  return NextResponse.rewrite(
    new URL(
      `/medicalneeds${pathname === "/" ? "" : pathname}`,
      request.url
    )
  )
}

  // Public recruitment website
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
