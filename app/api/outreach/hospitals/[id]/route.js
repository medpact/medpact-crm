import { getAdminSupabase, getRequestSession, jsonError } from "../../../../../lib/outreach-server"
export const runtime = "nodejs"
export async function GET(request,{params}) {
  if (!getRequestSession(request)) return jsonError("Please log in again",401)
  try {
    const {id} = await params
    const db = getAdminSupabase()
    const [hospitalResult,callsResult] = await Promise.all([
      db.from("outreach_hospitals").select("*").eq("id",id).single(),
      db.from("outreach_calls").select("*").eq("hospital_id",id).order("call_date",{ascending:false}).limit(200)
    ])
    if (hospitalResult.error) throw hospitalResult.error
    if (callsResult.error) throw callsResult.error
    return Response.json({success:true,hospital:hospitalResult.data,calls:callsResult.data || []})
  } catch (error) {
    console.error(error)
    return jsonError("Could not load hospital details",404)
  }
}
