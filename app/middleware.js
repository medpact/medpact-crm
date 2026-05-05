import { NextResponse } from 'next/server'

export function middleware(request) {
  const host = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname

  console.log("HOST:", host)
  console.log("PATH:", pathname)

  if (host.includes('care.medpact.in')) {
    const path = pathname === "/" ? "" : pathname

    return NextResponse.rewrite(
      new URL(`/medicaltourism${path}`, request.url)
    )
  }

  if (host.includes('dashboard.medpact.in')) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/((?!api|_next|favicon.ico).*)'],
}
