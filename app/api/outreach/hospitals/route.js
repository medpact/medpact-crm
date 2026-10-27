import { getAdminSupabase, getRequestSession, jsonError, OUTREACH_STATUSES } from "../../../../lib/outreach-server"
export const runtime = "nodejs"

export async function GET(request) {
  if (!getRequestSession(request)) return jsonError("Please log in again",401)
  const url = new URL(request.url)
  const search = (url.searchParams.get("search") || "").trim().replace(/[%(),]/g," ")
  const status = url.searchParams.get("status") || ""
  try {
    const db = getAdminSupabase()
    let query = db.from("outreach_hospitals").select("*").order("updated_at",{ascending:false}).limit(500)
    if (search) query = query.or(`hospital_name.ilike.%${search}%,city.ilike.%${search}%,phone.ilike.%${search}%`)
    if (status) query = query.eq("current_status",status)
    const { data,error } = await query
    if (error) throw error
    return Response.json({success:true,hospitals:data || []})
  } catch (error) {
    console.error(error)
    return jsonError("Could not load hospitals",500)
  }
}
export async function POST(request) {
  const session = getRequestSession(request)
  if (!session) return jsonError("Please log in again",401)
  try {
    const body = await request.json()
    const hospital_name = String(body.hospital_name || "").trim()
    const city = String(body.city || "").trim()
    if (!hospital_name || !city) return jsonError("Hospital name and city are required")
    const payload = {
      hospital_name, city,
      state:String(body.state || "").trim() || null,
      area:String(body.area || "").trim() || null,
      address:String(body.address || "").trim() || null,
      phone:String(body.phone || "").trim() || null,
      alternate_phone:String(body.alternate_phone || "").trim() || null,
      hospital_type:String(body.hospital_type || "").trim() || null,
      current_status:OUTREACH_STATUSES.includes(body.current_status) ? body.current_status : "not_contacted",
      assigned_to:session.username,
      general_remarks:String(body.general_remarks || "").trim() || null
    }
    const db = getAdminSupabase()
    const {data,error} = await db.from("outreach_hospitals").insert(payload).select("*").single()
    if (error) throw error
    return Response.json({success:true,hospital:data},{status:201})
  } catch (error) {
    console.error(error)
    return jsonError("Could not save hospital",500)
  }
}
