import { NextResponse } from 'next/server'

export function middleware(request) {
  const host = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname

  // Normalize host (remove port if exists)
  const cleanHost = host.split(':')[0]

  // 🌍 Medical Tourism Domain
  if (cleanHost === 'care.medpact.in') {
    const path = pathname === "/" ? "" : pathname

    return NextResponse.rewrite(
      new URL(`/medicaltourism${path}`, request.url)
    )
  }

  // 📊 Dashboard Domain
  if (cleanHost === 'dashboard.medpact.in') {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/((?!api|_next|favicon.ico).*)'],
}
