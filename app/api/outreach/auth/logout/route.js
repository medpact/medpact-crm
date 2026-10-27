export async function POST() {
  const response = Response.json({ success:true })
  response.headers.append("Set-Cookie", `medpact_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${process.env.NODE_ENV === "production" ? "; Secure" : ""}`)
  return response
}
