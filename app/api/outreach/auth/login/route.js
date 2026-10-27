import { USERS } from "../../../../../lib/users"
import { createSessionToken, jsonError } from "../../../../../lib/outreach-server"

export const runtime = "nodejs"
export async function POST(request) {
  try {
    const body = await request.json()
    const username = String(body.username || "").trim().toLowerCase()
    const password = String(body.password || "")
    if (!username || !password) return jsonError("Username and password are required",400)
    const user = USERS.find(item =>
      String(item.username || "").trim().toLowerCase() === username &&
      String(item.password || "") === password
    )
    if (!user) return jsonError("Invalid username or password",401)
    const token = createSessionToken(username)
    const response = Response.json({ success:true, username, role:user.role || "user" })
    response.headers.append("Set-Cookie", `medpact_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${10*60*60}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`)
    return response
  } catch (error) {
    console.error("Outreach login error:",error)
    return jsonError("Unable to sign in",500)
  }
}
