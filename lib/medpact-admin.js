import crypto from "crypto"
import { createClient } from "@supabase/supabase-js"

const COOKIE_NAME = "medpact_admin_session"
const MAX_AGE = 60 * 60 * 12

function secret() {
  return process.env.MEDPACT_ADMIN_SECRET || process.env.MEDPACT_ADMIN_PASSWORD || "change-this-secret"
}

function sign(value) {
  return crypto.createHmac("sha256", secret()).update(value).digest("base64url")
}

export function createAdminToken() {
  const payload = `${Date.now()}:${crypto.randomBytes(16).toString("hex")}`
  return `${Buffer.from(payload).toString("base64url")}.${sign(payload)}`
}

export function verifyAdminToken(token) {
  try {
    if (!token) return false
    const [encoded, signature] = token.split(".")
    if (!encoded || !signature) return false
    const payload = Buffer.from(encoded, "base64url").toString("utf8")
    const expected = sign(payload)
    if (signature.length !== expected.length) return false
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false
    const timestamp = Number(payload.split(":")[0])
    return Number.isFinite(timestamp) && Date.now() - timestamp < MAX_AGE * 1000
  } catch {
    return false
  }
}

export function adminCookieOptions() {
  return { name: COOKIE_NAME, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: MAX_AGE }
}

export function getAdminCookieName() { return COOKIE_NAME }

export function validAdminCredentials(username, password) {
  const expectedUser = process.env.MEDPACT_ADMIN_USERNAME
  const expectedPassword = process.env.MEDPACT_ADMIN_PASSWORD
  return !!expectedUser && !!expectedPassword && username === expectedUser && password === expectedPassword
}

export function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Missing Supabase server configuration.")
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}
