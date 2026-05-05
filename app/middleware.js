import { NextResponse } from 'next/server'

export function middleware(request) {
  const host = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname

  // 🌍 Medical Tourism Domain
  if (host.includes('care.medpact.in')) {
    return NextResponse.rewrite(
      new URL(`/medicaltourism${pathname}`, request.url)
    )
  }

  // 📊 Dashboard Domain
  if (host.includes('dashboard.medpact.in')) {
    return NextResponse.rewrite(
      new URL(`/dashboard${pathname}`, request.url)
    )
  }

  return NextResponse.next()
}
