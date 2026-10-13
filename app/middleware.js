
import { NextResponse } from "next/server"

export function middleware(request) {
  const host = (request.headers.get("host") || "")
    .split(":")[0]
    .toLowerCase()

  const pathname = request.nextUrl.pathname

  // Medical Tourism
  if (host === "care.medpact.in") {
    const path = pathname === "/" ? "" : pathname

    return NextResponse.rewrite(
      new URL(`/medicalneeds${path}`, request.url)
    )
  }

  // Doctors Recruitment Website
  if (
    host === "www.medpact.in" ||
    host === "medpact.in"
  ) {
    return NextResponse.rewrite(
      new URL(`/recruitment${pathname}`, request.url)
    )
  }

  // Existing Dashboard
  if (host === "dashboard.medpact.in") {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/((?!api|_next|favicon.ico).*)"],
}
