import { getAdminSupabase, getRequestSession, jsonError } from "../../../../lib/outreach-server"
export const runtime = "nodejs"
export async function GET(request) {
  if (!getRequestSession(request)) return jsonError("Please log in again",401)
  try {
    const db = getAdminSupabase()
    const today = new Date().toISOString().slice(0,10)
    const [hospitals,calls,interested,requirements,followups] = await Promise.all([
      db.from("outreach_hospitals").select("id",{count:"exact",head:true}),
      db.from("outreach_calls").select("id",{count:"exact",head:true}).gte("call_date",`${today}T00:00:00Z`).lte("call_date",`${today}T23:59:59Z`),
      db.from("outreach_hospitals").select("id",{count:"exact",head:true}).eq("current_status","interested"),
      db.from("outreach_hospitals").select("id",{count:"exact",head:true}).eq("current_status","requirement_identified"),
      db.from("outreach_calls").select("id",{count:"exact",head:true}).not("follow_up_date","is",null).lte("follow_up_date",today)
    ])
    for (const r of [hospitals,calls,interested,requirements,followups]) if (r.error) throw r.error
    return Response.json({success:true,stats:{totalHospitals:hospitals.count||0,callsToday:calls.count||0,interested:interested.count||0,requirementsIdentified:requirements.count||0,followUpsDue:followups.count||0}})
  } catch (error) {
    console.error(error)
    return jsonError("Could not load outreach statistics",500)
  }
}
