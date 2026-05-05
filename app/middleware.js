import { NextResponse } from 'next/server'

export function middleware(request) {
  const host = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname

  // 🌍 Medical Tourism
  if (host.includes('care.medpact.in')) {
    const path = pathname === "/" ? "" : pathname
    return NextResponse.rewrite(
      new URL(`/medicaltourism${path}`, request.url)
    )
  }

  // 📊 Dashboard
  if (host.includes('dashboard.medpact.in')) {
    return NextResponse.rewrite(
      new URL(`${pathname}`, request.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico).*)'],
}
