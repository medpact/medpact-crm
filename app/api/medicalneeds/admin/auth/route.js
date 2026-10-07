import { NextResponse } from "next/server"
import { adminCookieOptions, createAdminToken, getAdminCookieName, validAdminCredentials, verifyAdminToken } from "../../../../../lib/medpact-admin"

export async function GET(request) {
  const token = request.cookies.get(getAdminCookieName())?.value
  return NextResponse.json({ authenticated: verifyAdminToken(token) })
}

export async function POST(request) {
  try {
    const { username, password } = await request.json()
    if (!validAdminCredentials(username, password)) return NextResponse.json({ error: "Invalid username or password." }, { status: 401 })
    const response = NextResponse.json({ authenticated: true })
    response.cookies.set({ ...adminCookieOptions(), value: createAdminToken() })
    return response
  } catch {
    return NextResponse.json({ error: "Unable to sign in." }, { status: 400 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false })
  response.cookies.set({ ...adminCookieOptions(), value: "", maxAge: 0 })
  return response
}
