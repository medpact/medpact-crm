import "server-only"
import { createClient } from "@supabase/supabase-js"
import crypto from "node:crypto"

const SESSION_SECONDS = 10 * 60 * 60

export function getAdminSupabase() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}
function secret() {
  const value = process.env.MEDPACT_SESSION_SECRET
  if (!value || value.length < 32) throw new Error("MEDPACT_SESSION_SECRET must be at least 32 characters")
  return value
}
function sign(payload) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url")
}
export function createSessionToken(username) {
  const payload = Buffer.from(JSON.stringify({ username: String(username).toLowerCase(), exp: Math.floor(Date.now()/1000)+SESSION_SECONDS })).toString("base64url")
  return `${payload}.${sign(payload)}`
}
export function verifySessionToken(token) {
  if (!token || typeof token !== "string") return null
  const parts = token.split(".")
  if (parts.length !== 2) return null
  const [payload, signature] = parts
  const expected = sign(payload)
  const a = Buffer.from(signature), b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a,b)) return null
  try {
    const decoded = JSON.parse(Buffer.from(payload,"base64url").toString("utf8"))
    if (!decoded.username || !decoded.exp || decoded.exp <= Math.floor(Date.now()/1000)) return null
    return { username: decoded.username, exp: decoded.exp }
  } catch { return null }
}
export function getRequestSession(request) {
  const cookieHeader = request.headers.get("cookie") || ""
  const match = cookieHeader.match(/(?:^|;\s*)medpact_session=([^;]+)/)
  if (!match) return null
  return verifySessionToken(decodeURIComponent(match[1]))
}
export function jsonError(message,status=400) {
  return Response.json({ success:false, error:message }, { status })
}
export const OUTREACH_STATUSES = ["not_contacted","interested","requirement_identified","follow_up","no_current_requirement","not_interested","invalid_number"]
export const CALL_OUTCOMES = ["answered","busy","no_answer","call_back","not_connected","out_of_service","no_current_requirement","interested","requirement_identified","not_interested","other"]
